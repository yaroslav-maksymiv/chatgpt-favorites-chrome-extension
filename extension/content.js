const starSvgOutline = `
<svg xmlns="http://www.w3.org/2000/svg" fill="none" widht="25" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-md">
    <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
</svg>
`
const starSvgSolid = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="icon-md">
  <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd" />
</svg>
`

// Adds section with starred chats
const displayStarredChats = (starredChats) => {
    const nav = document.querySelector('nav[aria-label]')
    const container = nav.querySelector('div.flex.flex-col.gap-2.pb-2.text-token-text-primary.text-sm.mt-5')

    let chats = ''
    if (container) {
        if (starredChats.length > 0) {
            starredChats.forEach(chat => {
                chats += `
                    <li class="relative" style="opacity: 1; height: auto;">
                    <div class="group relative rounded-lg active:opacity-90 hover:bg-token-sidebar-surface-secondary">
                        <a is-starred="true" href="/${chat.chatType}/${chat.chatId}" class="flex items-center gap-2 p-2">
                            <div class="relative grow overflow-hidden whitespace-nowrap" dir="auto">${chat.chatTitle}<div
                                    class="absolute bottom-0 top-0 to-transparent ltr:right-0 ltr:bg-gradient-to-l rtl:left-0 rtl:bg-gradient-to-r from-token-sidebar-surface-primary from-token-sidebar-surface-primary can-hover:group-hover:from-token-sidebar-surface-secondary w-8 from-0% can-hover:group-hover:w-10 can-hover:group-hover:from-60%"
                                    style="width: 4.5rem;"></div>
                            </div>
                        </a>
                        <div
                            class="absolute bottom-0 top-0 items-center gap-1.5 pr-2 ltr:right-0 rtl:left-0 hidden can-hover:group-hover:flex">
                            <span class data-state="closed"></span>
                        </div>
                    </div>
                </li>
                `
            })
        } else {
            chats = '<div class="text-xs text-gray-500 pl-2">No items yet!</div>'
        }

        chrome.runtime.sendMessage({ action: 'isVisible' }, (isVisible) => {
            let isOpened = true
            let hiddenStyle = ''

            isOpened = isVisible
            if (!isVisible) {
                hiddenStyle = 'style="display: none;"'
            }

            const chatsBody = `
            <div opened="${isOpened}" class="starredItemsList relative mt-5 first:mt-0 last:mb-5 empty:mt-0 empty:hidden" style="height: auto; opacity: 1;">
                <div class="sticky top-0 z-20 bg-token-sidebar-surface-primary"><span class="cursor-pointer flex items-center justify-between h-9 items-center">
                        <h3
                            class="pb-2 pt-3 px-2 text-xs font-semibold text-ellipsis overflow-hidden break-all text-token-text-secondary">
                            Starred ⭐</h3>
                        <div class="toggle-arrow text-token-text-secondary transition hover:text-token-text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="icon-sm">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                            </svg>
                        </div>
                    </span></div>
                <ol ${hiddenStyle}>
                    ${chats}
                </ol>
            </div>
        `

            const tempElement = document.createElement('div')
            tempElement.innerHTML = chatsBody
            container.insertBefore(tempElement, container.firstChild)

            const starred = tempElement.querySelector('.starredItemsList')
            const ol = starred.querySelector('ol')
            const top = starred.querySelector('h3.overflow-hidden').parentElement
            const arrow = starred.querySelector('div.toggle-arrow')

            if (!isOpened) {
                arrow.style.transform = "rotate(180deg)"
            }

            top.addEventListener('click', () => {
                const isOpened = starred.getAttribute('opened')
                if (isOpened === 'true') {
                    ol.style.display = 'none'
                    starred.setAttribute('opened', 'false')
                    arrow.style.transform = "rotate(180deg)"
                    chrome.runtime.sendMessage({ action: 'setVisibility', isVisible: false })
                } else {
                    ol.style.display = 'block'
                    starred.setAttribute('opened', 'true')
                    arrow.style.transform = "rotate(0deg)"
                    chrome.runtime.sendMessage({ action: 'setVisibility', isVisible: true })
                }
            })
        })
    }
}

// Receives and displays list of starred chats 
const updateStarred = () => {
    const starred = document.querySelector('.starredItemsList')
    if (starred) {
        starred.parentElement.remove()
    }
    chrome.runtime.sendMessage({ action: 'getStarredChats' }, (response) => {
        displayStarredChats(response)
    })
}

// Removes starred status from button
const updateStatus = (chatType, chatId) => {
    const links = document.querySelectorAll(`a[href^="/${chatType}/${chatId}"]`)
    if (links) {
        links.forEach(link => {
            button = link.parentElement.querySelector('button.starButton')
            if (button) {
                button.setAttribute('is-starred', 'false')
                button.innerHTML = starSvgOutline
            }
        })
    }
}

// Adds star button to every chat element in sidebar
const addStarButton = () => {
    const sidebar = document.querySelector('.h-full.w-\\[260px\\]')
    const links = sidebar.querySelectorAll('a[href^="/"].flex.items-center.gap-2.p-2')

    links.forEach(link => {
        const hrefValue = link.getAttribute('href')
        const chatType = hrefValue.split('/')[1]
        const chatId = hrefValue.split('/')[2]
        const chatTitle = link.textContent
        const parentElement = link.parentElement

        const shadowElementParent = link.querySelector('div.whitespace-nowrap')
        const shadowElement = shadowElementParent.querySelector('div')
        shadowElement.style.width = '4.5rem'

        if (parentElement) {
            const span = parentElement.querySelector('span[data-state]')
            if (span) {
                span.className = 'flex items-center gap-1'
                if (!span.querySelector('button.starButton')) {
                    const button = document.createElement('button')
                    button.className = 'starButton flex items-center justify-center text-token-text-secondary transition hover:text-token-text-primary'
                    button.innerHTML = starSvgOutline

                    chrome.runtime.sendMessage({ action: 'exists', chatType, chatId }, (exists) => {
                        if (exists) {
                            button.setAttribute('is-starred', 'true')
                            button.innerHTML = starSvgSolid
                        } else {
                            button.setAttribute('is-starred', 'false')
                            button.innerHTML = starSvgOutline
                        }
                    })

                    span.insertBefore(button, span.firstChild)

                    button.addEventListener('click', () => {
                        if (button.getAttribute('is-starred') === 'false') {
                            button.innerHTML = starSvgSolid
                            button.setAttribute('is-starred', 'true')
                            chrome.runtime.sendMessage({ action: 'starChat', chatId, chatType, chatTitle }, () => updateStarred())
                        } else {
                            chrome.runtime.sendMessage({ action: 'removeChat', chatId, chatType }, () => {
                                updateStarred()
                                updateStatus(chatType, chatId)
                            })
                        }
                    })
                }
            }
        }
    })
}

// Calls addStarButton function when new data is loaded
const setupObserver = () => {
    const sidebar = document.querySelector('.h-full.w-\\[260px\\]')
    const chatHistoryNav = sidebar.querySelector('nav[aria-label]')
    const itemsScroll = chatHistoryNav.querySelector('.duration-500.overflow-y-auto')
    const itemsScrollContainer = itemsScroll.querySelector('.text-token-text-primary')

    const observer = new MutationObserver(mutations => {
        mutations.forEach(() => {
            addStarButton()
        })
    })

    observer.observe(itemsScrollContainer, { childList: true })
}

updateStarred()

addStarButton()
setupObserver()
