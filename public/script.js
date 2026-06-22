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

    // DATA PERTANYAAN (Dipindah dari server ke frontend agar jalan di Cloudflare Pages)
    const REWARD_LINK = 'https://www.canva.com/brand/join?token=TrzFqVwmUy9-UnaZVIgNEQ&referrer=team-invite';
    const questions = [
        { id: 1, question: "Sila ke-3 Pancasila berbunyi...", options: ["Ketuhanan Yang Maha Esa", "Kemanusiaan yang Adil dan Beradab", "Persatuan Indonesia", "Keadilan Sosial bagi Seluruh Rakyat Indonesia"], answer: "Persatuan Indonesia" },
        { id: 2, question: "Dasar negara Indonesia adalah...", options: ["UUD 1945", "Bhinneka Tunggal Ika", "Pancasila", "Burung Garuda"], answer: "Pancasila" },
        { id: 3, question: "Lambang sila ke-4 Pancasila adalah...", options: ["Bintang", "Pohon Beringin", "Kepala Banteng", "Padi dan Kapas"], answer: "Kepala Banteng" },
        { id: 4, question: "Antonim dari kata 'Rajin' adalah...", options: ["Pintar", "Malas", "Bodoh", "Kuat"], answer: "Malas" },
        { id: 5, question: "Kalimat utama dalam sebuah paragraf disebut...", options: ["Ide pokok", "Kalimat penjelas", "Gagasan pendukung", "Kesimpulan"], answer: "Ide pokok" },
        { id: 6, question: "Karangan yang menceritakan urutan waktu atau kejadian disebut...", options: ["Eksposisi", "Argumentasi", "Narasi", "Deskripsi"], answer: "Narasi" },
        { id: 7, question: "Hasil dari 15 x 6 adalah...", options: ["80", "90", "100", "75"], answer: "90" },
        { id: 8, question: "Akar kuadrat dari 144 adalah...", options: ["10", "12", "14", "16"], answer: "12" },
        { id: 9, question: "Berapa hasil dari 50 + 25 x 2?", options: ["150", "100", "75", "125"], answer: "100" },
        { id: 10, question: "Berapa jumlah pemain dalam satu tim bola basket?", options: ["5 orang", "6 orang", "11 orang", "9 orang"], answer: "5 orang" },
        { id: 11, question: "Induk organisasi sepak bola dunia adalah...", options: ["FIBA", "BWF", "FIFA", "PBVSI"], answer: "FIFA" },
        { id: 12, question: "Gaya bebas dalam olahraga renang sering disebut juga gaya...", options: ["Dada", "Punggung", "Kupu-kupu", "Crawl"], answer: "Crawl" },
        { id: 13, question: "Sikap menghargai dan menghormati perbedaan keyakinan antarsesama disebut...", options: ["Egois", "Toleransi", "Simpati", "Apatis"], answer: "Toleransi" },
        { id: 14, question: "Tempat ibadah umat Buddha adalah...", options: ["Masjid", "Gereja", "Pura", "Vihara"], answer: "Vihara" },
        { id: 15, question: "Alat musik angklung berasal dari daerah...", options: ["Jawa Tengah", "Jawa Timur", "Jawa Barat", "Bali"], answer: "Jawa Barat" },
        { id: 16, question: "Tari Kecak merupakan tarian tradisional yang berasal dari...", options: ["Sumatera Barat", "Bali", "Papua", "Jawa Tengah"], answer: "Bali" },
        { id: 17, question: "Batik Megamendung merupakan motif batik khas dari kota...", options: ["Pekalongan", "Yogyakarta", "Cirebon", "Solo"], answer: "Cirebon" },
        { id: 18, question: "What is the synonym of 'Happy'?", options: ["Sad", "Angry", "Glad", "Bored"], answer: "Glad" },
        { id: 19, question: "Bahasa Inggris dari kata 'Selasa' adalah...", options: ["Monday", "Tuesday", "Thursday", "Wednesday"], answer: "Tuesday" },
        { id: 20, question: "The sun ... in the east.", options: ["Rises", "Sets", "Shines", "Falls"], answer: "Rises" },
        { id: 21, question: "Proses perubahan wujud dari cair ke gas disebut...", options: ["Membeku", "Mencair", "Menguap", "Menyublim"], answer: "Menguap" },
        { id: 22, question: "Hewan pemakan daging disebut...", options: ["Herbivora", "Karnivora", "Omnivora", "Insektivora"], answer: "Karnivora" },
        { id: 23, question: "Planet terbesar di tata surya kita adalah...", options: ["Bumi", "Mars", "Jupiter", "Saturnus"], answer: "Jupiter" },
        { id: 24, question: "Bagian sel yang berfungsi sebagai pusat kendali adalah...", options: ["Mitokondria", "Nukleus", "Sitoplasma", "Membran Sel"], answer: "Nukleus" },
        { id: 25, question: "Benua terbesar di dunia adalah...", options: ["Benua Afrika", "Benua Asia", "Benua Eropa", "Benua Amerika"], answer: "Benua Asia" },
        { id: 26, question: "Mata uang negara Jepang adalah...", options: ["Yen", "Won", "Yuan", "Baht"], answer: "Yen" },
        { id: 27, question: "Garis yang membelah bumi menjadi bagian utara dan selatan disebut...", options: ["Bujur", "Lintang", "Khatulistiwa", "Meridian"], answer: "Khatulistiwa" },
        { id: 28, question: "Bahan lunak alami yang sering digunakan untuk membuat kerajinan gerabah adalah...", options: ["Plastisin", "Tanah Liat", "Gips", "Lilin"], answer: "Tanah Liat" },
        { id: 29, question: "Proses mengolah barang bekas menjadi barang yang dapat digunakan lagi disebut...", options: ["Reboisasi", "Daur Ulang", "Eksploitasi", "Sanitasi"], answer: "Daur Ulang" },
        { id: 30, question: "Teknik menyambung kain dengan kain menggunakan benang dan jarum disebut...", options: ["Menganyam", "Membatik", "Menjahit", "Menyulam"], answer: "Menjahit" },
        { id: 31, question: "Siapakah yang menjahit Bendera Pusaka Merah Putih?", options: ["Cut Nyak Dien", "Ibu Fatmawati", "R.A. Kartini", "Dewi Sartika"], answer: "Ibu Fatmawati" },
        { id: 32, question: "Peristiwa Rengasdengklok terjadi pada tanggal...", options: ["16 Agustus 1945", "17 Agustus 1945", "18 Agustus 1945", "10 November 1945"], answer: "16 Agustus 1945" },
        { id: 33, question: "Kerajaan Islam pertama di Indonesia adalah...", options: ["Kerajaan Demak", "Kerajaan Samudera Pasai", "Kerajaan Mataram", "Kerajaan Banten"], answer: "Kerajaan Samudera Pasai" },
        { id: 34, question: "Naskah proklamasi kemerdekaan Indonesia diketik oleh...", options: ["Soekarno", "Moh. Hatta", "Sayuti Melik", "Sutan Syahrir"], answer: "Sayuti Melik" },
        { id: 35, question: "Gunung tertinggi di Pulau Jawa adalah...", options: ["Gunung Merapi", "Gunung Semeru", "Gunung Bromo", "Gunung Sindoro"], answer: "Gunung Semeru" },
        { id: 36, question: "Rumus kimia dari Air adalah...", options: ["CO2", "O2", "H2O", "NaCl"], answer: "H2O" },
        { id: 37, question: "Siapakah penemu bola lampu pijar?", options: ["Albert Einstein", "Thomas Alva Edison", "Isaac Newton", "Alexander Graham Bell"], answer: "Thomas Alva Edison" },
        { id: 38, question: "Pencipta lagu kebangsaan Indonesia Raya adalah...", options: ["W.R. Supratman", "Ismail Marzuki", "C. Simanjuntak", "Ibu Sud"], answer: "W.R. Supratman" },
        { id: 39, question: "Sistem pernapasan pada manusia menggunakan...", options: ["Insang", "Paru-paru", "Trakea", "Kulit"], answer: "Paru-paru" },
        { id: 40, question: "Senjata tradisional khas Jawa Barat adalah...", options: ["Keris", "Rencong", "Kujang", "Mandau"], answer: "Kujang" }
    ];

    // Fungsi untuk mengambil pertanyaan (Frontend-only)
    async function fetchQuestion() {
        showLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 300)); // Efek loading
            const randomIndex = Math.floor(Math.random() * questions.length);
            const data = questions[randomIndex];
            
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

    // Fungsi mengecek jawaban langsung di frontend
    async function submitAnswer(e) {
        e.preventDefault();
        
        const selectedOption = document.querySelector('input[name="answer"]:checked');
        if (!selectedOption) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Mengecek...';
        clearInterval(timerInterval);

        try {
            await new Promise(resolve => setTimeout(resolve, 400)); // Efek mengecek
            
            const questionId = parseInt(questionIdInput.value);
            const answer = selectedOption.value;
            
            const q = questions.find(q => q.id === questionId);
            
            let data = { success: false, message: 'Pertanyaan tidak ditemukan' };
            if (q) {
                if (q.answer.toLowerCase() === answer.toLowerCase()) {
                    data = { success: true, rewardLink: REWARD_LINK };
                } else {
                    data = { success: false, message: 'Jawaban salah. Coba lagi!' };
                }
            }

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
