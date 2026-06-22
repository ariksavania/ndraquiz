document.addEventListener('DOMContentLoaded', () => {
    const loadingEl = document.getElementById('loading');
    const quizContainer = document.getElementById('quiz-container');
    const successContainer = document.getElementById('success-container');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const questionIdInput = document.getElementById('question-id');
    const submitBtn = document.getElementById('submit-btn');
    const messageEl = document.getElementById('message');
    const quizForm = document.getElementById('quiz-form');
    const claimBtn = document.getElementById('claim-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const rewardBoxContainer = document.getElementById('reward-box-container');
    const rewardLinkInput = document.getElementById('reward-link-input');
    const useLinkBtn = document.getElementById('use-link-btn');
    const copyLinkBtn = document.getElementById('copy-link-btn');
    const playAgainBtn2 = document.getElementById('play-again-btn-2');
    const timerProgress = document.getElementById('timer-progress');
    const timerCount = document.getElementById('timer-count');
    
    let currentRewardLink = '';
    let timerInterval;
    let timeLeft = 20;

    function startTimer() {
        clearInterval(timerInterval);
        timeLeft = 20;
        updateTimerDisplay();
        
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            
            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                showMessage('Waktu habis! Pertanyaan akan diganti.', 'error');
                submitBtn.disabled = true;
                
                // Disable all radio buttons
                document.querySelectorAll('input[name="answer"]').forEach(radio => radio.disabled = true);
                
                setTimeout(() => {
                    fetchQuestion();
                }, 2000);
            }
        }, 1000);
    }

    function updateTimerDisplay() {
        timerCount.textContent = Math.max(0, timeLeft);
        const percentage = (timeLeft / 20) * 100;
        timerProgress.style.width = percentage + '%';
        
        if (timeLeft <= 5) {
            timerProgress.style.background = 'var(--error)';
            timerCount.style.color = 'var(--error)';
        } else {
            timerProgress.style.background = 'var(--primary-color)';
            timerCount.style.color = 'var(--text-muted)';
        }
    }

    // Fungsi untuk mengambil pertanyaan dari server
    async function fetchQuestion() {
        showLoading(true);
        try {
            const response = await fetch('/api/question');
            const data = await response.json();
            
            questionText.textContent = data.question;
            questionIdInput.value = data.id;
            
            // Render opsi
            optionsContainer.innerHTML = '';
            data.options.forEach((opt, index) => {
                const label = document.createElement('label');
                label.className = 'option-label';
                
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'answer';
                input.value = opt;
                
                // Tambahkan event listener untuk menyoroti opsi terpilih
                input.addEventListener('change', () => {
                    document.querySelectorAll('.option-label').forEach(l => l.classList.remove('selected'));
                    label.classList.add('selected');
                    submitBtn.disabled = false;
                    hideMessage();
                });

                label.appendChild(input);
                label.appendChild(document.createTextNode(opt));
                optionsContainer.appendChild(label);
            });

            submitBtn.disabled = true;
            hideMessage();
            showLoading(false);
            startTimer();
        } catch (error) {
            console.error('Error fetching question:', error);
            showMessage('Gagal memuat pertanyaan. Silakan muat ulang halaman.', 'error');
            showLoading(false);
        }
    }

    // Fungsi mengirim jawaban ke server
    async function submitAnswer(e) {
        e.preventDefault();
        
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        if (!selectedOption) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Mengecek...';
        clearInterval(timerInterval);

        try {
            const response = await fetch('/api/answer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: parseInt(questionIdInput.value),
                    answer: selectedOption.value
                })
            });

            const data = await response.json();

            if (data.success) {
                // Jawaban benar
                currentRewardLink = data.rewardLink;
                rewardLinkInput.value = data.rewardLink;
                quizContainer.classList.add('hidden');
                successContainer.classList.remove('hidden');
            } else {
                // Jawaban salah
                showMessage('Jawaban salah! Pertanyaan akan diganti.', 'error');
                submitBtn.disabled = true;
                
                // Disable all radio buttons
                document.querySelectorAll('input[name="answer"]').forEach(radio => radio.disabled = true);
                
                // Animasi getar pada card (micro-interaction)
                const card = document.querySelector('.glass-card');
                card.style.animation = 'shake 0.5s';
                setTimeout(() => card.style.animation = '', 500);

                // Ganti pertanyaan setelah 2 detik
                setTimeout(() => {
                    fetchQuestion();
                }, 2000);
            }
        } catch (error) {
            console.error('Error submitting answer:', error);
            showMessage('Terjadi kesalahan jaringan.', 'error');
            submitBtn.disabled = false;
        } finally {
            submitBtn.textContent = 'Kirim Jawaban';
        }
    }

    function showLoading(isLoading) {
        if (isLoading) {
            loadingEl.classList.remove('hidden');
            quizContainer.classList.add('hidden');
            successContainer.classList.add('hidden');
            rewardBoxContainer.classList.add('hidden');
        } else {
            loadingEl.classList.add('hidden');
            quizContainer.classList.remove('hidden');
        }
    }

    function showMessage(msg, type) {
        messageEl.textContent = msg;
        messageEl.className = `message ${type}`;
        messageEl.classList.remove('hidden');
    }

    function hideMessage() {
        messageEl.classList.add('hidden');
    }

    // CSS Keyframes inject untuk animasi shake
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-10px); }
            40%, 80% { transform: translateX(10px); }
        }
    `;
    document.head.appendChild(style);

    // Event Listeners
    quizForm.addEventListener('submit', submitAnswer);
    
    playAgainBtn.addEventListener('click', () => {
        successContainer.classList.add('hidden');
        fetchQuestion();
    });

    claimBtn.addEventListener('click', () => {
        // Efek meledak (confetti)
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#00e5ff', '#00838f', '#18ffff', '#ffffff']
        });

        // Sembunyikan pesan sukses, tampilkan kotak hadiah
        successContainer.classList.add('hidden');
        rewardBoxContainer.classList.remove('hidden');
    });

    useLinkBtn.addEventListener('click', () => {
        window.open(currentRewardLink, '_blank');
    });

    copyLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(currentRewardLink).then(() => {
            const originalText = copyLinkBtn.textContent;
            copyLinkBtn.textContent = 'Tersalin!';
            setTimeout(() => {
                copyLinkBtn.textContent = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Gagal menyalin:', err);
            alert('Gagal menyalin link.');
        });
    });

    playAgainBtn2.addEventListener('click', () => {
        rewardBoxContainer.classList.add('hidden');
        fetchQuestion();
    });

    // Inisialisasi: ambil pertanyaan pertama
    fetchQuestion();
});
