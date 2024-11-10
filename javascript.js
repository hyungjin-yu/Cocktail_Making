document.addEventListener('DOMContentLoaded', function() {
    const liquids = document.querySelectorAll('.liquid');
    const status = document.getElementById('status');
    const redirectThreshold = 80;

    function generateRandomRGBA() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgba(${r}, ${g}, ${b}, 0.8)`;
    }

    function mixColors(color1, color2) {
        try {
            if (!color1 || !color2) {
                return generateRandomRGBA();
            }

            let rgb1 = color1.match(/\d+/g);
            let rgb2 = color2.match(/\d+/g);
            
            if (!rgb1 || !rgb2 || rgb1.length < 3 || rgb2.length < 3) {
                return generateRandomRGBA();
            }
            
            rgb1 = rgb1.map(Number);
            rgb2 = rgb2.map(Number);
            
            let mixedColor = rgb1.map((c, i) => Math.floor((c + rgb2[i]) / 2));
            return `rgba(${mixedColor[0]}, ${mixedColor[1]}, ${mixedColor[2]}, 0.8)`;
        } catch (error) {
            console.error('색상 믹싱 오류:', error);
            return generateRandomRGBA();
        }
    }

    function updateStatus(message, color = null, isComplete = false) {
        status.innerText = message;
        if (isComplete) {
            status.style.color = color || '#2ecc71';
            status.style.fontWeight = 'bold';
            status.classList.add('complete');
        } else {
            status.style.color = '#333';
            status.style.fontWeight = 'normal';
            status.classList.remove('complete');
        }
    }

    function addToHistory(colors) {
        const historyList = document.getElementById('history-list');
        const time = new Date().toLocaleTimeString();
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        // 칵테일 색상을 작은 원으로 표시
        const colorsHtml = colors.map(color => 
            `<span style="display:inline-block; width:15px; height:15px; border-radius:50%; background-color:${color}; margin-right:5px;"></span>`
        ).join('');
        
        historyItem.innerHTML = `
            <div class="time">${time}</div>
            <div class="colors">${colorsHtml}</div>
        `;
        
        // 최근 항목을 위에 추가
        historyList.insertBefore(historyItem, historyList.firstChild);
        
        // 최대 10개까지만 보관
        if (historyList.children.length > 10) {
            historyList.removeChild(historyList.lastChild);
        }
        
        // 로컬 스토리지에 저장
        saveToLocalStorage(colors, time);
    }

    function saveToLocalStorage(colors, time) {
        const history = JSON.parse(localStorage.getItem('cocktailHistory') || '[]');
        history.unshift({ colors, time });
        if (history.length > 10) history.pop();
        localStorage.setItem('cocktailHistory', JSON.stringify(history));
    }

    function loadHistory() {
        const history = JSON.parse(localStorage.getItem('cocktailHistory') || '[]');
        const historyList = document.getElementById('history-list');
        
        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            const colorsHtml = item.colors.map(color => 
                `<span style="display:inline-block; width:15px; height:15px; border-radius:50%; background-color:${color}; margin-right:5px;"></span>`
            ).join('');
            
            historyItem.innerHTML = `
                <div class="time">${item.time}</div>
                <div class="colors">${colorsHtml}</div>
            `;
            
            historyList.appendChild(historyItem);
        });
    }

    // 페이지 로드 시 히스토리 불러오기
    loadHistory();

    // 칵테일 제조 시작 시 현재 색상들을 저장
    const currentColors = [];
    
    function pourLiquid(index) {
        const liquid = liquids[index];
        let newColor = generateRandomRGBA();
        
        currentColors[index] = newColor;
        
        if (index === 0) {
            newColor = generateRandomRGBA();
            updateStatus('칵테일 제조 시작... 🍸');
        } else {
            const previousColor = window.getComputedStyle(liquids[index - 1]).backgroundColor;
            newColor = mixColors(previousColor, generateRandomRGBA());
            updateStatus(`칵테일 제조 중... ${(index + 1) * 33}% 완성 🍹`);
        }
        
        liquid.style.backgroundColor = newColor;
        liquid.style.height = `${10 + index * 30}%`;
        
        if (index === liquids.length - 1) {
            setTimeout(() => {
                addToHistory(currentColors);
            }, 500);
        }
    }

    // 순차적으로 액체 붓기
    pourLiquid(0);
    setTimeout(() => pourLiquid(1), 3000);
    setTimeout(() => pourLiquid(2), 6000);
});
