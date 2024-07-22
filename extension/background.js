chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['starredChats', 'starredVisible'], (data) => {
        if (!data.starredChats) {
            chrome.storage.local.set({ starredChats: [] }, () => {
                console.log('Starred chats storage initialized')
            })
        }
        if (data.starredVisible === undefined) {
            chrome.storage.local.set({ starredVisible: true })
        }
    })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case 'starChat':
            const newChat = { chatType: message.chatType, chatId: message.chatId, chatTitle: message.chatTitle }
            chrome.storage.local.get('starredChats', (data) => {
                const starredChats = data.starredChats || []
                const chatExists = starredChats.some(chat => chat.chatType === newChat.chatType && chat.chatId === newChat.chatId)

                if (!chatExists) {
                    starredChats.push(newChat)
                    chrome.storage.local.set({ starredChats }, () => {
                        console.log(`Chat ID ${message.chatId} starred`)
                    })
                }
            })
            break
        case 'getStarredChats':
            chrome.storage.local.get('starredChats', (data) => {
                sendResponse(data.starredChats || [])
            })
            return true
        case 'removeChat':
            chrome.storage.local.get('starredChats', (data) => {
                let starredChats = data.starredChats || []
                starredChats = starredChats.filter(chat => !(chat.chatType === message.chatType && chat.chatId === message.chatId))
                chrome.storage.local.set({ starredChats }, () => {
                    console.log(`Chat ID ${message.chatId} was removed form the list`)
                })
            })
            break
        case 'exists':
            chrome.storage.local.get('starredChats', (data) => {
                const starredChats = data.starredChats || []
                const chatExists = starredChats.some(chat => chat.chatType === message.chatType && chat.chatId === message.chatId)
                sendResponse(chatExists)
            })
            return true
        case 'isVisible':
            chrome.storage.local.get('starredVisible', (data) => {
                const isVisible = data.starredVisible !== undefined ? data.starredVisible : true
                sendResponse(isVisible)
            })
            return true
        case 'setVisibility':
            chrome.storage.local.set({ starredVisible: message.isVisible }, () => {
                console.log('Starred Visibility was set to ' + message.isVisible)
            })
            break
        default:
            break
    }
})