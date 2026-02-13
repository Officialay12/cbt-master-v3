// ===== AI CHAT ASSISTANT - COMPLETE WORKING VERSION =====
class AIChatAssistant {
    constructor(app) {
        this.app = app;
        this.initElements();
        this.initSpeech();
        this.initEvents();
    }

    initElements() {
        this.el = {
            container: document.getElementById('aiChat'),
            toggle: document.getElementById('aiChatToggle'),
            close: document.getElementById('aiClose'),
            messages: document.getElementById('aiMessages'),
            input: document.getElementById('aiInput'),
            send: document.getElementById('aiSend'),
            voice: document.getElementById('aiVoice'),
            indicator: document.getElementById('voiceIndicator'),
            commands: document.querySelectorAll('.quick-command')
        };
    }

    initSpeech() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SR();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (e) => {
                this.hideIndicator();
                this.process(e.results[0][0].transcript);
            };

            this.recognition.onerror = () => {
                this.hideIndicator();
                this.addMsg("Sorry, I couldn't hear you. Please type instead.", 'ai', 'error');
            };

            this.recognition.onend = () => this.hideIndicator();
        } else if (this.el.voice) {
            this.el.voice.style.display = 'none';
        }
    }

    initEvents() {
        this.el.toggle?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggle();
        });

        this.el.close?.addEventListener('click', (e) => {
            e.preventDefault();
            this.close();
        });

        this.el.send?.addEventListener('click', (e) => {
            e.preventDefault();
            this.sendMsg();
        });

        this.el.input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendMsg();
            }
        });

        this.el.voice?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleVoice();
        });

        this.el.commands.forEach(cmd => {
            cmd.addEventListener('click', () => this.process(cmd.dataset.command));
        });

        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                this.toggle();
            }
        });

        document.addEventListener('click', (e) => {
            if (this.el.container?.classList.contains('active')) {
                if (!this.el.container.contains(e.target) && !this.el.toggle?.contains(e.target)) {
                    this.close();
                }
            }
        });
    }

    toggle() {
        this.el.container?.classList.toggle('active');
        if (this.el.container?.classList.contains('active')) {
            setTimeout(() => this.el.input?.focus(), 100);
        }
    }

    close() {
        this.el.container?.classList.remove('active');
    }

    sendMsg() {
        const msg = this.el.input?.value.trim();
        if (msg) {
            this.addMsg(msg, 'user');
            this.el.input.value = '';
            this.process(msg);
        }
    }

    addMsg(msg, sender, type = 'normal') {
        if (!this.el.messages) return;

        const div = document.createElement('div');
        div.className = `message ${sender}-message`;

        let content = `<p>${msg}</p>`;
        if (type === 'error') content = `<p style="color:#ff6b6b">${msg}</p>`;
        if (type === 'success') content = `<p style="color:#00ff88">${msg}</p>`;

        div.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${sender === 'ai' ? 'robot' : 'user'}"></i>
            </div>
            <div class="message-content">${content}</div>
        `;

        this.el.messages.appendChild(div);
        this.el.messages.scrollTop = this.el.messages.scrollHeight;
    }

    addTyping() {
        this.removeTyping();
        const div = document.createElement('div');
        div.className = 'message ai-message typing';
        div.id = 'typingIndicator';
        div.innerHTML = `
            <div class="message-avatar"><i class="fas fa-robot"></i></div>
            <div class="message-content">
                <div class="typing-dots"><span></span><span></span><span></span></div>
            </div>
        `;
        this.el.messages?.appendChild(div);
        this.el.messages.scrollTop = this.el.messages.scrollHeight;
    }

    removeTyping() {
        document.getElementById('typingIndicator')?.remove();
    }

    process(cmd) {
        if (!cmd) return;

        const text = cmd.toLowerCase().trim();
        this.addTyping();

        setTimeout(() => {
            this.removeTyping();

            if (text.includes('start') || text.includes('begin') || text.includes('practice')) {
                if (text.includes('gst101') || text.includes('english')) {
                    this.addMsg('🎯 **GST101 - Use of English**\n\nLoading practice... Good luck! 🍀', 'ai', 'success');
                    setTimeout(() => this.app?.startExam('gst101'), 1500);
                }
                else if (text.includes('gns105') || text.includes('agriculture')) {
                    this.addMsg('🌱 **GNS105 - Modern Agriculture**\n\nStarting practice... You got this! 💪', 'ai', 'success');
                    setTimeout(() => this.app?.startExam('gns105'), 1500);
                }
                else if (text.includes('mth101') || text.includes('math')) {
                    this.addMsg('📐 **MTH101 - Mathematics**\n\nMath practice beginning! 🚀', 'ai', 'success');
                    setTimeout(() => this.app?.startExam('mth101'), 1500);
                }
                else if (text.includes('phy101') || text.includes('physics')) {
                    this.addMsg('⚛️ **PHY101 - Physics**\n\nPhysics practice launching! 🔬', 'ai', 'success');
                    setTimeout(() => this.app?.startExam('phy101'), 1500);
                }
                else {
                    this.addMsg('📚 **Available Courses:**\n\n• GST101 - English\n• GNS105 - Agriculture\n• MTH101 - Math\n• PHY101 - Physics', 'ai');
                }
            }
            else if (text.includes('go to') || text.includes('navigate') || text.includes('show')) {
                if (text.includes('home') || text.includes('welcome')) {
                    this.addMsg('🏠 Taking you home...', 'ai');
                    setTimeout(() => this.app?.showScreen('welcome'), 800);
                }
                else if (text.includes('course')) {
                    this.addMsg('📋 Opening course selection...', 'ai');
                    setTimeout(() => this.app?.showScreen('course'), 800);
                }
                else if (text.includes('result')) {
                    this.addMsg('📊 Showing your results...', 'ai');
                    setTimeout(() => this.app?.showScreen('results'), 800);
                }
            }
            else if (text.includes('tip') || text.includes('advice')) {
                const tips = [
                    '⏱️ **Time Management**: Spend max 30 seconds per question. Mark difficult ones and return later.',
                    '📝 **Read Carefully**: Look for keywords like "NOT", "EXCEPT", "CORRECT" in questions.',
                    '🎯 **Process of Elimination**: Remove wrong answers first to increase your odds.',
                    '💪 **Practice Consistently**: 30 minutes daily > 5 hours once a week.',
                    '📊 **Review Mistakes**: Learn from incorrect answers - they\'re your best teacher.'
                ];
                this.addMsg(`💡 **Exam Tip**\n\n${tips[Math.floor(Math.random() * tips.length)]}`, 'ai');
            }
            else if (text.includes('help')) {
                this.addMsg(
                    '🤖 **AI Assistant Help**\n\n' +
                    '**Voice Commands:**\n' +
                    '• Click 🎤 and speak naturally\n' +
                    '• Say "start GST101" to begin practice\n' +
                    '• Say "go to courses" to browse\n\n' +
                    '**Text Commands:**\n' +
                    '• Start [course] - Begin practice\n' +
                    '• Go to [screen] - Navigate\n' +
                    '• Show tips - Get exam advice\n' +
                    '• Check results - View performance',
                    'ai'
                );
            }
            else if (text.includes('creator') || text.includes('developer') || text.includes('ayo')) {
                this.addMsg(
                    '👨‍💻 **About the Creator**\n\n' +
                    '**Omole Ayomide David**\n' +
                    '• 100-Level Mathematics Student, OOU\n' +
                    '• Full Stack Developer (2+ years)\n' +
                    '• Startup Founder\n\n' +
                    '**Connect**: WhatsApp @ayocodes\n\n' +
                    '_Built with 💚 by a student, for students_',
                    'ai'
                );
            }
            else if (text.includes('hi') || text.includes('hello') || text.includes('hey') || text.includes('how far')) {
                const greetings = [
                    'Hey there! Ready to practice? 🚀',
                    'Hello! Your study buddy is here! 📚',
                    'Yo! What shall we practice today? 💪',
                    'How far! Ready to crush some exams? 🎯'
                ];
                this.addMsg(greetings[Math.floor(Math.random() * greetings.length)], 'ai');
            }
            else if (text.includes('bye') || text.includes('exit') || text.includes('close')) {
                this.addMsg('👋 Closing chat. Click the robot to chat again!', 'ai');
                setTimeout(() => this.close(), 1500);
            }
            else {
                this.addMsg(
                    '🤔 Not sure about that. Try:\n' +
                    '• "start GST101"\n' +
                    '• "go to courses"\n' +
                    '• "exam tips"\n' +
                    '• "help"',
                    'ai'
                );
            }
        }, 800);
    }

    toggleVoice() {
        if (!this.recognition) {
            this.addMsg('Voice recognition not supported in your browser.', 'ai', 'error');
            return;
        }

        if (this.el.voice?.classList.contains('active')) {
            this.recognition.stop();
            this.el.voice.classList.remove('active');
            this.hideIndicator();
        } else {
            this.showIndicator();
            this.el.voice?.classList.add('active');
            try {
                this.recognition.start();
            } catch (e) {
                this.hideIndicator();
                this.el.voice?.classList.remove('active');
                this.addMsg('Please allow microphone access.', 'ai', 'error');
            }
        }
    }

    showIndicator() {
        this.el.indicator?.classList.add('active');
    }

    hideIndicator() {
        this.el.indicator?.classList.remove('active');
        this.el.voice?.classList.remove('active');
    }
}

// Initialize when app is ready
document.addEventListener('DOMContentLoaded', () => {
    const check = setInterval(() => {
        if (window.cbtMaster) {
            window.aiAssistant = new AIChatAssistant(window.cbtMaster);
            console.log('🤖 AI Assistant Ready!');
            clearInterval(check);
        }
    }, 100);
});
