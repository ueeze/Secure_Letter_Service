import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { Note, NoteStatus, NoteError } from '../types/note'
import { decryptText } from '../utils/crypto'
import { fetchNote, markNoteAsRead, deleteNote } from '../services/noteService'

// 상태별 컴포넌트
const LoadingView = () => (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-xl text-gray-600">불러오는 중...</p>
    </div>
)

const ExpiredView = () => (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg flex flex-col items-center">
        <div className="text-orange-500 text-6xl mb-4">⏰</div>
        <h2 className="text-2xl font-bold text-orange-500 mb-2">만료된 쪽지입니다</h2>
        <p className="text-gray-600">이 쪽지는 만료되어 더 이상 읽을 수 없습니다.</p>
    </div>
)

const NotFoundView = () => (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg flex flex-col items-center">
        <div className="text-red-500 text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-red-500 mb-2">쪽지를 찾을 수 없습니다</h2>
        <p className="text-gray-600">링크가 잘못되었거나 만료되었을 수 있습니다.</p>
    </div>
)

const ReadView = () => (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg flex flex-col items-center">
        <div className="text-yellow-500 text-6xl mb-4">🔒</div>
        <h2 className="text-2xl font-bold text-yellow-600 mb-2">이미 열람된 쪽지입니다</h2>
        <p className="text-gray-600">보안을 위해 쪽지는 한 번만 읽을 수 있습니다.</p>
    </div>
)

interface LockedViewProps {
    onDecrypt: (password: string) => void
    error: NoteError | null
}

const LockedView = ({ onDecrypt, error }: LockedViewProps) => {
    const [password, setPassword] = useState('')

    const handleSubmit = () => {
        if (password) {
            onDecrypt(password)
        }
    }

    return (
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg">
            <div className="flex items-center mb-6">
                <div className="text-4xl mr-4">🔒</div>
                <h1 className="text-2xl font-bold text-gray-800">비밀번호 입력</h1>
            </div>
            <div className="space-y-4">
                <input
                    type="password"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out"
                    placeholder="쪽지를 열어보기 위한 비밀번호를 입력하세요"
                    value={password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSubmit()
                    }}
                />
                {error && (
                    <p className="text-red-500 text-sm">{error.message}</p>
                )}
                <button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transform transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
                    onClick={handleSubmit}
                >
                    <span className="mr-2">🔓</span>
                    쪽지 열어보기
                </button>
            </div>
        </div>
    )
}

interface SuccessViewProps {
    text: string
}

const SuccessView = ({ text }: SuccessViewProps) => (
    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-blue-100 transform transition-all duration-500 ease-in-out hover:shadow-xl">
        <div className="flex items-center mb-6">
            <div className="text-4xl mr-4">✉️</div>
            <h1 className="text-2xl font-bold text-gray-800">비밀 쪽지</h1>
        </div>
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
            <p className="text-gray-700 whitespace-pre-wrap break-words">{text}</p>
        </div>
        <div className="mt-6 text-center text-sm text-gray-500">
            이 쪽지는 1분 후에 영구적으로 삭제됩니다.
        </div>
    </div>
)

export default function ViewNote() {
    const { id } = useParams()
    const [note, setNote] = useState<Note | null>(null)
    const [status, setStatus] = useState<NoteStatus>('loading')
    const [error, setError] = useState<NoteError | null>(null)
    const [decryptedText, setDecryptedText] = useState<string | null>(null)

    useEffect(() => {
        const loadNote = async () => {
            if (!id) {
                setStatus('notfound')
                return
            }

            const noteData = await fetchNote(id)
            
            if (!noteData) {
                setStatus('notfound')
                return
            }

            if (noteData.expiresAt < new Date()) {
                await deleteNote(id)
                setStatus('expired')
                return
            }

            if (noteData.read) {
                setStatus('read')
                return
            }

            setNote(noteData)
            setStatus('locked')
        }

        loadNote()
    }, [id])

    const handleDecrypt = async (password: string) => {
        if (!note || !password) return

        const decrypted = decryptText(note.text, password)
        
        if (!decrypted) {
            setError({ message: '비밀번호가 올바르지 않습니다.' })
            return
        }

        setDecryptedText(decrypted)
        setStatus('success')

        // 읽음 상태로 변경
        await markNoteAsRead(note.id)

        // 1분 후 삭제
        setTimeout(async () => {
            try {
                await deleteNote(note.id)
            } catch (error) {
                console.error('쪽지 삭제 오류:', error)
            }
        }, 60 * 1000)
    }

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return <LoadingView />
            case 'expired':
                return <ExpiredView />
            case 'notfound':
                return <NotFoundView />
            case 'read':
                return <ReadView />
            case 'locked':
                return <LockedView onDecrypt={handleDecrypt} error={error} />
            case 'success':
                return decryptedText ? <SuccessView text={decryptedText} /> : null
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="max-w-xl mx-auto">
                {renderContent()}
            </div>
        </div>
    )
}
