import api from './axios'

export function getPostUserId(userId, page = 0, size = 8) {
    return api.get(`/feature/posts/user/${userId}`, {
        params: {
            page,
            size
        }
    })
}

export async function fetchPostList(page = 0, size = 10) {
    return await api.get(`/feature/posts?page=${page}&size=${size}`)
}

export function fetchPostCategories() {
    return api.get('/feature/posts/categories')
}

export function postPost(formData) {
    return api.post('/feature/posts', formData)
}

export async function getPostDetail(postId) {
    const res = await api.get(`/feature/posts/${postId}`)
    return res.data
}

export function updatePost(postId, formData) {
    return api.put(`/feature/posts/${postId}`, formData)
}

export function deletePost(postId) {
    return api.delete(`/feature/posts/${postId}`)
}

export function postComment(postId, content) {
    return api.post(`/feature/posts/${postId}/comments`, {
        content: content
    })
}

export const deleteComment = (postId, commentId) => {
    return api.delete(`/feature/posts/${postId}/comments/${commentId}`)
}

export const reportPost = (reportData) => {
    return api.post('/feature/reports/post', reportData)
}

export const reportComment = (reportData) => {
    return api.post('/feature/reports/comment', reportData)
}
