import { useState } from 'react'
import type { FormEvent } from 'react'
import { createNote } from '../services/noteService'

interface FormData {
    text: string;
    password: string;
}

interface FormErrors {
    text?: string;
    password?: string;
}

export default function WriteNote() {
    const [formData, setFormData] = useState<FormData>({ text: '', password: '' })
    const [errors, setErrors] = useState<FormErrors>({})
    const [link, setLink] = useState('')
    const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle')
    const [isLoading, setIsLoading] = useState(false)

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}
        
        if (!formData.text.trim()) {
            newErrors.text = '내용을 입력해주세요'
        }
        
        if (!formData.password.trim()) {
            newErrors.password = '비밀번호를 입력해주세요'
        } else if (formData.password.length < 4) {
            newErrors.password = '비밀번호는 4자 이상이어야 합니다'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setIsLoading(true)
        try {
            const id = await createNote(formData.text, formData.password)
            const url = `${window.location.origin}${window.location.pathname}#/note/${id}`
            setLink(url)
            setCopyStatus('idle')
        } catch (error) {
            console.error('쪽지 생성 오류:', error)
            alert('쪽지 생성 중 오류가 발생했습니다. 다시 시도해주세요.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(link)
            setCopyStatus('copied')
            setTimeout(() => setCopyStatus('idle'), 2000)
        } catch (err) {
            alert('링크 복사에 실패했습니다. 직접 선택하여 복사해주세요.')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
            <div className="max-w-xl mx-auto">
                <div className="bg-white/80 backdrop-blur-sm p-8 rounded-lg shadow-lg border border-blue-100 transform transition-all duration-500 ease-in-out">
                    <div className="flex items-center mb-6">
                        <div className="text-4xl mr-4">✏️</div>
                        <h1 className="text-2xl font-bold text-gray-800">비밀 쪽지 작성</h1>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <textarea
                                className={`w-full h-48 p-4 bg-gray-50 border ${
                                    errors.text ? 'border-red-300' : 'border-gray-200'
                                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out text-gray-700 placeholder-gray-400`}
                                placeholder="전하고 싶은 메시지를 입력하세요..."
                                value={formData.text}
                                onChange={(e) => setFormData(prev => ({ ...prev, text: e.target.value }))}
                            />
                            {errors.text && (
                                <p className="mt-1 text-sm text-red-500">{errors.text}</p>
                            )}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    🔒 비밀번호 설정
                                </label>
                                <input
                                    type="password"
                                    className={`w-full p-3 bg-gray-50 border ${
                                        errors.password ? 'border-red-300' : 'border-gray-200'
                                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ease-in-out`}
                                    placeholder="쪽지를 열어볼 때 필요한 비밀번호를 입력하세요 (4자 이상)"
                                    value={formData.password}
                                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                    minLength={4}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                                )}
                            </div>
                        </div>
                        
                        <button
                            type="submit"
                            className={`w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transform transition-all duration-200 ease-in-out hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    생성 중...
                                </>
                            ) : (
                                <>
                                    <span className="mr-2">✨</span>
                                    비밀 링크 생성
                                </>
                            )}
                        </button>
                    </form>

                    {link && (
                        <div className="mt-6 p-6 bg-green-50 rounded-lg border border-green-100 animate-fade-in">
                            <div className="flex items-center mb-3">
                                <div className="text-2xl mr-2">🔗</div>
                                <h2 className="text-lg font-semibold text-green-700">링크가 생성되었습니다!</h2>
                            </div>
                            <div className="bg-white p-4 rounded border border-green-200 flex items-center">
                                <div className="flex-1 font-mono text-sm text-gray-600 break-all mr-4">
                                    {link}
                                </div>
                                <button
                                    onClick={handleCopy}
                                    className={`flex items-center px-4 py-2 rounded-lg transition-all duration-200 ${
                                        copyStatus === 'copied'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                    }`}
                                >
                                    <span className="mr-2">
                                        {copyStatus === 'copied' ? '✓' : '📋'}
                                    </span>
                                    {copyStatus === 'copied' ? '복사됨' : '복사하기'}
                                </button>
                            </div>
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                                <p className="text-sm text-yellow-700 flex items-center">
                                    <span className="text-xl mr-2">🔑</span>
                                    비밀번호: <span className="font-mono ml-2">{formData.password}</span>
                                </p>
                                <p className="text-xs text-yellow-600 mt-1">
                                    ⚠️ 반드시 비밀번호를 수신인에게 안전한 방법으로 전달해주세요!
                                </p>
                            </div>
                            <p className="mt-3 text-xs text-gray-500">
                                * 이 링크는 7일 후에 만료됩니다.
                            </p>
                        </div>
                    )}

                    <div className="mt-6 text-center text-sm text-gray-500">
                        작성된 쪽지는 한 번만 읽을 수 있으며, 읽은 후에는 자동으로 삭제됩니다.
                    </div>
                </div>
            </div>
        </div>
    )
}
