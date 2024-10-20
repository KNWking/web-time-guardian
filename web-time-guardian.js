// ==UserScript==
// @name         网页浏览时间限制器
// @namespace    https://github.com/KNWking
// @version      0.0.1
// @description  控制特定网页的浏览时间
// @match        *://*/*
// @grant        none
// @license      GPL-3.0
// ==/UserScript==

(function() {
    'use strict';

    // 从 localStorage 获取管理的 URL 列表
    function getManagedUrls() {
        return JSON.parse(localStorage.getItem('managedUrls') || '[]');
    }

    // 保存管理的 URL 列表到 localStorage
    function saveManagedUrls(urls) {
        localStorage.setItem('managedUrls', JSON.stringify(urls));
    }

    // 检查当前页面是否需要管理时间
    function shouldManageCurrentPage() {
        const currentUrl = window.location.origin;
        return getManagedUrls().includes(currentUrl);
    }

    // 创建弹出框
    function createPopup(message, buttons) {
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border: 2px solid #333;
            z-index: 9999;
            text-align: center;
        `;
        popup.innerHTML = `<p>${message}</p>`;

        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.textContent = button.text;
            btn.onclick = () => {
                button.action();
                document.body.removeChild(popup);
            };
            btn.style.margin = '5px';
            popup.appendChild(btn);
        });

        document.body.appendChild(popup);
    }

    // 设置定时器
    function setTimer(minutes) {
        return setTimeout(() => {
            const elapsedTime = Date.now() - startTime;
            const elapsedMinutes = Math.round(elapsedTime / 60000);

            createPopup(
                `规定的${minutes}分钟已经过去，您已经浏览了${elapsedMinutes}分钟。`,
                [
                    {
                        text: '延长时间',
                        action: () => promptForTime()
                    },
                    {
                        text: '关闭页面',
                        action: () => window.close()
                    }
                ]
            );
        }, minutes * 60000);
    }

    // 提示用户输入浏览时间
    function promptForTime() {
        createPopup(
            '请选择您想要浏览这个网页的时间（分钟）：',
            [
                { text: '5分钟', action: () => startTimer(5) },
                { text: '10分钟', action: () => startTimer(10) },
                { text: '15分钟', action: () => startTimer(15) },
                { text: '30分钟', action: () => startTimer(30) },
                { text: '自定义', action: () => {
                        const customTime = prompt('请输入自定义时间（分钟）：');
                        if (customTime && !isNaN(customTime)) {
                            startTimer(parseInt(customTime));
                        } else {
                            alert('请输入有效的数字！');
                            promptForTime();
                        }
                    }}
            ]
        );
    }

    // 开始计时
    let timerHandle;
    let startTime;

    function startTimer(minutes) {
        if (timerHandle) {
            clearTimeout(timerHandle);
        }
        startTime = Date.now();
        timerHandle = setTimer(minutes);
    }

    // 添加当前网页到管理列表
    function addCurrentPage() {
        const currentUrl = window.location.origin;
        const managedUrls = getManagedUrls();
        if (!managedUrls.includes(currentUrl)) {
            managedUrls.push(currentUrl);
            saveManagedUrls(managedUrls);
            alert('当前网页已添加到时间管理列表');
        } else {
            alert('当前网页已在时间管理列表中');
        }
    }

    // 从管理列表中移除当前网页
    function removeCurrentPage() {
        const currentUrl = window.location.origin;
        let managedUrls = getManagedUrls();
        managedUrls = managedUrls.filter(url => url !== currentUrl);
        saveManagedUrls(managedUrls);
        alert('当前网页已从时间管理列表中移除');
    }

    // 创建控制面板
    function createControlPanel() {
        const panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: white;
            padding: 10px;
            border: 1px solid #333;
            z-index: 9998;
        `;

        const addButton = document.createElement('button');
        addButton.textContent = '添加到管理';
        addButton.onclick = addCurrentPage;

        const removeButton = document.createElement('button');
        removeButton.textContent = '从管理中移除';
        removeButton.onclick = removeCurrentPage;

        panel.appendChild(addButton);
        panel.appendChild(removeButton);

        document.body.appendChild(panel);
    }

    // 初始化
    createControlPanel();
    if (shouldManageCurrentPage()) {
        promptForTime();
    }
})();
