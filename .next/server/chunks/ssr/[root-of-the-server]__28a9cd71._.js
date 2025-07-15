module.exports = {

"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[project]/src/data/coursesData.js [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "coursesData": (()=>coursesData),
    "default": (()=>__TURBOPACK__default__export__)
});
const coursesData = [
    {
        id: 1,
        title: "Introduction to React",
        description: "Learn the fundamentals of React development",
        category: "Programming",
        level: "Beginner",
        duration: "4 weeks",
        instructor: "John Doe",
        rating: 4.8,
        students: 1234,
        image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300&h=200&fit=crop&crop=center",
        isEnrolled: true,
        progress: 65,
        introMaterial: {
            title: "Selamat Datang di Kursus React",
            content: [
                {
                    type: "text",
                    content: "Selamat datang di kursus **Introduction to React**! Dalam kursus ini, Anda akan mempelajari dasar-dasar pengembangan aplikasi web menggunakan React, salah satu library JavaScript paling populer saat ini.\n\nReact dikembangkan oleh Facebook dan digunakan oleh ribuan perusahaan di seluruh dunia untuk membangun aplikasi web yang interaktif dan responsif."
                },
                {
                    type: "image",
                    src: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=600&h=300&fit=crop&crop=center",
                    alt: "React Development Environment",
                    caption: "React ecosystem dan tools yang akan dipelajari"
                },
                {
                    type: "text",
                    content: "### Apa yang akan Anda pelajari:"
                },
                {
                    type: "list",
                    items: [
                        "Konsep dasar React dan JSX",
                        "Component-based architecture",
                        "State management dan Props",
                        "Event handling dan lifecycle methods",
                        "Hooks dan functional components",
                        "Best practices dalam React development"
                    ]
                },
                {
                    type: "video",
                    title: "Video Pengenalan",
                    src: "https://www.youtube.com/embed/Ke90Tje7VS0",
                    duration: "5:30"
                },
                {
                    type: "pdf",
                    title: "Panduan Dasar React",
                    description: "Dokumen PDF berisi panduan dasar React untuk pemula",
                    embedUrl: "https://mozilla.github.io/pdf.js/web/viewer.html?file=https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                    downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                },
                {
                    type: "external_link",
                    title: "Dokumentasi Resmi React",
                    description: "Kunjungi dokumentasi resmi React untuk informasi lebih lanjut",
                    url: "https://reactjs.org/docs/getting-started.html"
                }
            ]
        },
        lessons: [
            {
                id: 1,
                title: "Pengenalan React",
                type: "reading",
                content: [
                    {
                        type: "text",
                        content: "# Pengenalan React\n\nReact adalah library JavaScript yang dikembangkan oleh Facebook untuk membangun user interface yang interaktif dan efisien."
                    },
                    {
                        type: "text",
                        content: "## Apa itu React?\n\nReact adalah library JavaScript yang berfokus pada pembuatan komponen UI yang dapat digunakan kembali. React menggunakan konsep Virtual DOM untuk meningkatkan performa aplikasi."
                    },
                    {
                        type: "text",
                        content: "## Fitur Utama React"
                    },
                    {
                        type: "list",
                        ordered: true,
                        items: [
                            "**Component-Based**: Membangun aplikasi dengan komponen yang dapat digunakan kembali",
                            "**Virtual DOM**: Meningkatkan performa dengan minimal DOM manipulation",
                            "**JSX**: Sintaks yang memungkinkan penulisan HTML di dalam JavaScript",
                            "**One-Way Data Flow**: Data mengalir dari parent ke child component"
                        ]
                    },
                    {
                        type: "text",
                        content: "## Keunggulan React"
                    },
                    {
                        type: "list",
                        items: [
                            "**Performance**: Virtual DOM membuat aplikasi lebih cepat",
                            "**Reusability**: Komponen dapat digunakan kembali",
                            "**Community**: Ekosistem yang besar dan aktif",
                            "**Learning Curve**: Relatif mudah dipelajari"
                        ]
                    },
                    {
                        type: "text",
                        content: "## Kapan Menggunakan React?\n\nReact cocok untuk:"
                    },
                    {
                        type: "list",
                        items: [
                            "Single Page Applications (SPA)",
                            "Aplikasi dengan UI yang kompleks",
                            "Aplikasi yang membutuhkan performa tinggi",
                            "Proyek dengan tim yang besar"
                        ]
                    },
                    {
                        type: "text",
                        content: "💡 **Tips:** Mari mulai membangun aplikasi React yang amazing!"
                    },
                    {
                        type: "pdf",
                        title: "React Cheat Sheet",
                        description: "Ringkasan konsep-konsep penting dalam React",
                        embedUrl: "https://mozilla.github.io/pdf.js/web/viewer.html?file=https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                        downloadUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                    }
                ]
            },
            {
                id: 2,
                title: "Video Tutorial React Basics",
                type: "video",
                content: [
                    {
                        type: "text",
                        content: "# Video Tutorial React Basics\n\nDalam video tutorial ini, Anda akan mempelajari dasar-dasar React melalui demonstrasi langsung."
                    },
                    {
                        type: "video",
                        title: "React Basics Tutorial",
                        src: "https://www.youtube.com/embed/Ke90Tje7VS0",
                        duration: "20:15"
                    },
                    {
                        type: "external_link",
                        title: "Materi Tambahan React Basics",
                        description: "Kunjungi situs resmi React untuk mempelajari lebih lanjut",
                        url: "https://reactjs.org/tutorial/tutorial.html"
                    }
                ]
            }
        ],
        preTest: {
            id: "pre1",
            title: "Pre-Test: React Fundamentals",
            questions: [
                {
                    id: 1,
                    question: "React dikembangkan oleh?",
                    options: [
                        "Google",
                        "Facebook",
                        "Microsoft",
                        "Apple"
                    ],
                    correct: 1
                },
                {
                    id: 2,
                    question: "Apa kepanjangan dari JSX?",
                    options: [
                        "JavaScript XML",
                        "Java Syntax Extension",
                        "JSON XML",
                        "JavaScript Extension"
                    ],
                    correct: 0
                },
                {
                    id: 3,
                    question: "React adalah?",
                    options: [
                        "Framework",
                        "Library",
                        "Database",
                        "Server"
                    ],
                    correct: 1
                },
                {
                    id: 4,
                    question: "Apa itu component dalam React?",
                    options: [
                        "Fungsi atau class yang mengembalikan JSX",
                        "Database",
                        "CSS file",
                        "HTML file"
                    ],
                    correct: 0
                }
            ],
            postWork: {
                title: "Tugas Pasca Kerja - React Fundamentals",
                description: `
        <h3>Tugas Praktik React</h3>
        <p>Setelah menyelesaikan kursus ini, Anda diharapkan untuk membuat aplikasi React sederhana yang mendemonstrasikan pemahaman Anda tentang konsep-konsep dasar React.</p>
        
        <h4>Persyaratan Tugas:</h4>
        <ul>
          <li>Buat aplikasi React dengan minimal 3 komponen</li>
          <li>Implementasikan state management menggunakan useState</li>
          <li>Gunakan props untuk komunikasi antar komponen</li>
          <li>Tambahkan event handling untuk interaksi user</li>
          <li>Styling menggunakan CSS atau CSS-in-JS</li>
        </ul>
        
        <h4>Deliverables:</h4>
        <p>Silakan submit salah satu dari:</p>
        <ul>
          <li><strong>Source Code:</strong> File ZIP berisi seluruh project React</li>
          <li><strong>Repository Link:</strong> Link ke GitHub repository</li>
          <li><strong>Live Demo:</strong> Link ke deployed application (Netlify, Vercel, dll)</li>
        </ul>
        
        <blockquote style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
          <p style="margin: 0;">💡 <strong>Tips:</strong> Pastikan code Anda clean, well-documented, dan mengikuti best practices React!</p>
        </blockquote>
      `,
                submissionFormat: "both",
                fileSettings: {
                    maxSize: 10,
                    allowedTypes: [
                        "zip",
                        "rar",
                        "pdf",
                        "docx",
                        "doc"
                    ]
                },
                instructions: "Upload file project atau berikan link repository/demo aplikasi Anda.",
                requirements: "Aplikasi harus berjalan tanpa error dan mendemonstrasikan konsep React yang telah dipelajari."
            },
            finalProject: {
                title: "Proyek Akhir - Aplikasi React Lengkap",
                description: `
        <h3>Proyek Akhir: Aplikasi React Komprehensif</h3>
        <p>Sebagai proyek akhir, Anda akan membuat aplikasi React yang lebih kompleks yang mengintegrasikan semua konsep yang telah dipelajari dalam kursus ini.</p>
        
        <h4>Spesifikasi Proyek:</h4>
        <ul>
          <li><strong>Tema:</strong> Bebas (e.g., Todo App, Weather App, E-commerce, Blog, dll)</li>
          <li><strong>Komponen:</strong> Minimal 5 komponen dengan hierarki yang jelas</li>
          <li><strong>State Management:</strong> Gunakan useState dan useEffect</li>
          <li><strong>API Integration:</strong> Konsumsi minimal 1 external API</li>
          <li><strong>Routing:</strong> Implementasi React Router (opsional)</li>
          <li><strong>Responsive Design:</strong> Aplikasi harus responsive</li>
        </ul>
        
        <h4>Kriteria Penilaian:</h4>
        <ol>
          <li><strong>Functionality (40%):</strong> Aplikasi berjalan sesuai spesifikasi</li>
          <li><strong>Code Quality (30%):</strong> Clean code, proper structure, comments</li>
          <li><strong>UI/UX (20%):</strong> Design yang menarik dan user-friendly</li>
          <li><strong>Innovation (10%):</strong> Kreativitas dan fitur tambahan</li>
        </ol>
        
        <h4>Deliverables:</h4>
        <ul>
          <li><strong>Source Code:</strong> Complete project files (ZIP/RAR)</li>
          <li><strong>Documentation:</strong> README.md dengan setup instructions</li>
          <li><strong>Demo:</strong> Link ke live application atau video demo</li>
          <li><strong>Presentation:</strong> Slide presentasi (PDF/PPT) - opsional</li>
        </ul>
        
        <div style="background-color: #ecfdf5; border: 1px solid #10b981; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h5 style="color: #065f46; margin-top: 0;">🎯 Deadline & Submission</h5>
          <p style="margin-bottom: 0; color: #047857;">Proyek harus diselesaikan dalam waktu 2 minggu setelah menyelesaikan semua materi kursus. Submit melalui platform ini atau kirim link repository.</p>
        </div>
      `,
                submissionFormat: "both",
                fileSettings: {
                    maxSize: 50,
                    allowedTypes: [
                        "zip",
                        "rar",
                        "pdf",
                        "pptx",
                        "ppt",
                        "docx",
                        "doc"
                    ]
                },
                instructions: "Upload complete project files dan/atau berikan link ke repository dan live demo.",
                requirements: "Proyek harus memenuhi semua spesifikasi yang disebutkan dan berjalan tanpa error.",
                linkGuidelines: "Untuk submission link, pastikan repository bersifat public dan include README yang jelas."
            }
        },
        postTest: {
            id: "post1",
            title: "Post-Test: React Fundamentals",
            questions: [
                {
                    id: 1,
                    question: "Virtual DOM dalam React berfungsi untuk?",
                    options: [
                        "Styling",
                        "Meningkatkan performa",
                        "Database",
                        "Testing"
                    ],
                    correct: 1
                },
                {
                    id: 2,
                    question: "Komponen dalam React sebaiknya?",
                    options: [
                        "Besar dan kompleks",
                        "Kecil dan dapat digunakan kembali",
                        "Hanya satu per aplikasi",
                        "Tidak perlu dipisah"
                    ],
                    correct: 1
                },
                {
                    id: 3,
                    question: "useState adalah?",
                    options: [
                        "Hook untuk mengelola state",
                        "Component",
                        "Props",
                        "Event handler"
                    ],
                    correct: 0
                },
                {
                    id: 4,
                    question: "Props dalam React digunakan untuk?",
                    options: [
                        "Mengirim data dari parent ke child component",
                        "Styling",
                        "Database connection",
                        "Routing"
                    ],
                    correct: 0
                },
                {
                    id: 5,
                    question: "useEffect digunakan untuk?",
                    options: [
                        "Side effects dan lifecycle methods",
                        "Styling",
                        "State management",
                        "Routing"
                    ],
                    correct: 0
                },
                {
                    id: 6,
                    question: "Apa itu key prop dalam React?",
                    options: [
                        "Identifier unik untuk list items",
                        "Password",
                        "CSS class",
                        "Event handler"
                    ],
                    correct: 0
                }
            ]
        }
    },
    {
        id: 2,
        title: "Advanced JavaScript",
        description: "Master advanced JavaScript concepts and patterns",
        category: "Programming",
        level: "Advanced",
        duration: "6 weeks",
        instructor: "Jane Smith",
        rating: 4.9,
        students: 856,
        image: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=300&h=200&fit=crop&crop=center",
        isEnrolled: false,
        progress: 0,
        introMaterial: {
            title: "Menguasai JavaScript Tingkat Lanjut",
            content: [
                {
                    type: "text",
                    content: "Selamat datang di kursus Advanced JavaScript! Kursus ini dirancang untuk developer yang sudah memiliki pemahaman dasar JavaScript dan ingin menguasai konsep-konsep advanced."
                },
                {
                    type: "text",
                    content: "JavaScript adalah bahasa yang sangat powerful dan fleksibel. Dalam kursus ini, kita akan menggali lebih dalam tentang fitur-fitur advanced yang akan membuat Anda menjadi JavaScript developer yang lebih baik."
                },
                {
                    type: "image",
                    src: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop&crop=center",
                    alt: "JavaScript Code on Screen",
                    caption: "Konsep-konsep advanced JavaScript yang akan dipelajari"
                },
                {
                    type: "text",
                    content: "Topik yang akan dibahas:"
                },
                {
                    type: "list",
                    items: [
                        "Closures dan Scope Chain",
                        "Prototypes dan Inheritance",
                        "Asynchronous Programming (Promises, Async/Await)",
                        "Design Patterns dalam JavaScript",
                        "Performance Optimization",
                        "Modern ES6+ Features"
                    ]
                },
                {
                    type: "pdf",
                    src: "https://eloquentjavascript.net/Eloquent_JavaScript.pdf",
                    title: "Eloquent JavaScript (Free PDF)",
                    description: "Buku gratis tentang JavaScript programming - Eloquent JavaScript by Marijn Haverbeke (400+ halaman)"
                },
                {
                    type: "external_link",
                    url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
                    title: "MDN JavaScript Guide",
                    description: "Dokumentasi resmi JavaScript dari Mozilla Developer Network"
                },
                {
                    type: "video",
                    src: "https://www.youtube.com/embed/hdI2bqOjy3c",
                    title: "JavaScript Advanced - Course Overview",
                    duration: "8:20"
                }
            ]
        },
        lessons: [
            {
                id: 1,
                title: "Pengenalan JavaScript Advanced",
                type: "reading",
                content: `
          <h1>JavaScript Advanced Concepts</h1>
          
          <p>JavaScript adalah bahasa pemrograman yang sangat powerful dengan banyak fitur advanced yang perlu dikuasai.</p>
          
          <h2>Closures</h2>
          
          <p>Closure adalah fungsi yang memiliki akses ke variabel di scope luar bahkan setelah fungsi luar selesai dieksekusi.</p>
          
          <pre style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #007bff; overflow-x: auto;"><code>function outerFunction(x) {
  return function innerFunction(y) {
    return x + y;
  };
}

const addFive = outerFunction(5);
console.log(addFive(3)); // Output: 8</code></pre>
          
          <h2>Prototypes</h2>
          
          <p>JavaScript menggunakan prototype-based inheritance yang berbeda dari class-based inheritance.</p>
          
          <pre style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #007bff; overflow-x: auto;"><code>function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  return \`Hello, I'm \${this.name}\`;
};

const john = new Person('John');
console.log(john.greet()); // Hello, I'm John</code></pre>
          
          <h2>Asynchronous Programming</h2>
          
          <p>Memahami Promises, async/await, dan event loop adalah kunci untuk menguasai JavaScript modern.</p>
          
          <pre style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #007bff; overflow-x: auto;"><code>// Promise example
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('Data fetched successfully!');
    }, 2000);
  });
};

// Async/Await example
async function getData() {
  try {
    const data = await fetchData();
    console.log(data);
  } catch (error) {
    console.error('Error:', error);
  }
}</code></pre>
          
          <div style="background-color: #e9f5ff; border: 1px solid #4299e1; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #2b6cb0;">💡 <strong>Pro Tip:</strong> Memahami konsep-konsep advanced ini akan membuat Anda menjadi JavaScript developer yang lebih baik!</p>
          </div>
        `
            },
            {
                id: 2,
                title: "Closures dan Scope Chain",
                type: "video",
                videoUrl: "https://www.youtube.com/embed/3a0I8ICR1Vg",
                duration: "15:30",
                description: "Video tutorial mendalam tentang closures dan bagaimana scope chain bekerja di JavaScript"
            },
            {
                id: 3,
                title: "JavaScript Design Patterns",
                type: "reading",
                content: `
          <h1>JavaScript Design Patterns</h1>
          
          <p>Design patterns adalah solusi yang telah terbukti untuk masalah umum dalam pengembangan software.</p>
          
          <h2>Module Pattern</h2>
          
          <p>Pattern ini memungkinkan enkapsulasi dan privacy dalam JavaScript.</p>
          
          <pre style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #007bff; overflow-x: auto;"><code>const MyModule = (function() {
  let privateVariable = 0;
  
  function privateFunction() {
    console.log('This is private');
  }
  
  return {
    publicMethod: function() {
      privateVariable++;
      privateFunction();
      return privateVariable;
    },
    
    getCount: function() {
      return privateVariable;
    }
  };
})();</code></pre>
          
          <h2>Observer Pattern</h2>
          
          <p>Pattern ini memungkinkan objek untuk memberitahu objek lain tentang perubahan state.</p>
          
          <pre style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; border-left: 4px solid #007bff; overflow-x: auto;"><code>class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(data));
    }
  }
}</code></pre>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">🎯 <strong>Best Practice:</strong> Design patterns membantu membuat code yang lebih maintainable dan scalable!</p>
          </div>
        `
            },
            {
                id: 4,
                title: "Performance Optimization Techniques",
                type: "mixed",
                content: [
                    {
                        type: "text",
                        content: "Optimasi performa adalah aspek penting dalam pengembangan JavaScript. Berikut adalah teknik-teknik yang perlu dikuasai:"
                    },
                    {
                        type: "image",
                        src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop&crop=center",
                        alt: "Performance Monitoring Dashboard",
                        caption: "Diagram teknik optimasi performa JavaScript"
                    },
                    {
                        type: "text",
                        content: "## Debouncing dan Throttling\n\nTeknik ini digunakan untuk mengontrol frekuensi eksekusi fungsi, terutama untuk event handling."
                    },
                    {
                        type: "code",
                        language: "javascript",
                        content: `// Debouncing example
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// Throttling example
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}`
                    },
                    {
                        type: "pdf",
                        src: "https://addyosmani.com/resources/essentialjsdesignpatterns/book/",
                        title: "Learning JavaScript Design Patterns (Free Online Book)",
                        description: "Buku gratis tentang JavaScript Design Patterns oleh Addy Osmani - tersedia online"
                    },
                    {
                        type: "external_link",
                        url: "https://web.dev/fast/",
                        title: "Web.dev Performance Guide",
                        description: "Panduan performa web dari Google Developers"
                    }
                ]
            }
        ],
        preTest: {
            id: "pre2",
            title: "Pre-Test: Advanced JavaScript",
            questions: [
                {
                    id: 1,
                    question: "Apa itu closure dalam JavaScript?",
                    options: [
                        "Fungsi yang tertutup",
                        "Fungsi yang memiliki akses ke scope luar",
                        "Fungsi tanpa parameter",
                        "Fungsi yang tidak return"
                    ],
                    correct: 1
                },
                {
                    id: 2,
                    question: "Apa perbedaan antara let dan var?",
                    options: [
                        "Tidak ada perbedaan",
                        "let memiliki block scope, var memiliki function scope",
                        "var lebih modern",
                        "let tidak bisa diubah"
                    ],
                    correct: 1
                },
                {
                    id: 3,
                    question: "Apa itu hoisting dalam JavaScript?",
                    options: [
                        "Mengangkat variabel ke atas",
                        "Menghapus variabel",
                        "Mengubah tipe data",
                        "Membuat fungsi baru"
                    ],
                    correct: 0
                }
            ]
        },
        postTest: {
            id: "post2",
            title: "Post-Test: Advanced JavaScript",
            questions: [
                {
                    id: 1,
                    question: "JavaScript menggunakan inheritance berbasis?",
                    options: [
                        "Class",
                        "Prototype",
                        "Interface",
                        "Module"
                    ],
                    correct: 1
                },
                {
                    id: 2,
                    question: "Apa itu Promise dalam JavaScript?",
                    options: [
                        "Objek untuk menangani operasi asynchronous",
                        "Fungsi biasa",
                        "Tipe data primitif",
                        "Method array"
                    ],
                    correct: 0
                },
                {
                    id: 3,
                    question: "Async/await adalah?",
                    options: [
                        "Syntax untuk menangani Promise",
                        "Tipe data baru",
                        "Framework JavaScript",
                        "Library eksternal"
                    ],
                    correct: 0
                },
                {
                    id: 4,
                    question: "Apa itu destructuring dalam JavaScript?",
                    options: [
                        "Menghancurkan objek",
                        "Mengekstrak nilai dari array/objek",
                        "Membuat array baru",
                        "Menghapus properti"
                    ],
                    correct: 1
                }
            ]
        }
    },
    {
        id: 3,
        title: "UI/UX Design Fundamentals",
        description: "Learn the principles of user interface and user experience design",
        category: "Design",
        level: "Beginner",
        duration: "5 weeks",
        instructor: "Mike Johnson",
        rating: 4.7,
        students: 2156,
        image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300&h=200&fit=crop&crop=center",
        isEnrolled: true,
        progress: 30,
        introMaterial: {
            title: "Dasar-dasar UI/UX Design",
            content: [
                {
                    type: "text",
                    content: "Selamat datang di kursus UI/UX Design Fundamentals! Dalam era digital ini, kemampuan merancang interface yang user-friendly dan pengalaman pengguna yang optimal sangat penting."
                },
                {
                    type: "text",
                    content: "UI (User Interface) dan UX (User Experience) adalah dua aspek yang saling berkaitan dalam menciptakan produk digital yang sukses. Kursus ini akan memberikan Anda fondasi yang kuat dalam kedua bidang tersebut."
                },
                {
                    type: "image",
                    src: "https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?w=600&h=300&fit=crop&crop=center",
                    alt: "UI/UX Design Process",
                    caption: "Proses design thinking dalam UI/UX"
                },
                {
                    type: "text",
                    content: "Yang akan Anda pelajari:"
                },
                {
                    type: "list",
                    items: [
                        "Prinsip-prinsip dasar UI Design",
                        "User Research dan Persona Development",
                        "Wireframing dan Prototyping",
                        "Color Theory dan Typography",
                        "Usability Testing",
                        "Design Systems dan Style Guides"
                    ]
                },
                {
                    type: "video",
                    src: "https://www.youtube.com/embed/c9Wg6Cb_YlU",
                    title: "Introduction to UI/UX Design",
                    duration: "7:45"
                }
            ]
        },
        lessons: [
            {
                id: 1,
                title: "Pengenalan UI/UX Design",
                type: "reading",
                content: `
# UI/UX Design Fundamentals

UI/UX Design adalah bidang yang menggabungkan seni dan sains untuk menciptakan pengalaman digital yang optimal.

## Perbedaan UI dan UX

**UI (User Interface)** fokus pada tampilan visual dan interaksi.
**UX (User Experience)** fokus pada keseluruhan pengalaman pengguna.

## Prinsip Design

1. **Usability**: Mudah digunakan
2. **Accessibility**: Dapat diakses semua orang
3. **Consistency**: Konsisten dalam design
4. **Feedback**: Memberikan feedback yang jelas

## Design Process

1. Research
2. Ideation
3. Prototyping
4. Testing
5. Implementation
        `
            }
        ],
        preTest: {
            id: "pre3",
            title: "Pre-Test: UI/UX Design",
            questions: [
                {
                    id: 1,
                    question: "UI adalah singkatan dari?",
                    options: [
                        "User Interface",
                        "User Integration",
                        "Universal Interface",
                        "Unified Interface"
                    ],
                    correct: 0
                },
                {
                    id: 2,
                    question: "UX adalah singkatan dari?",
                    options: [
                        "User Experience",
                        "User Extension",
                        "Universal Experience",
                        "User Execution"
                    ],
                    correct: 0
                },
                {
                    id: 3,
                    question: "Apa perbedaan utama antara UI dan UX?",
                    options: [
                        "UI fokus pada tampilan, UX fokus pada pengalaman",
                        "Tidak ada perbedaan",
                        "UI lebih penting dari UX",
                        "UX hanya untuk mobile"
                    ],
                    correct: 0
                }
            ]
        },
        postTest: {
            id: "post3",
            title: "Post-Test: UI/UX Design",
            questions: [
                {
                    id: 1,
                    question: "Prinsip utama dalam UX Design adalah?",
                    options: [
                        "Estetika",
                        "Usability",
                        "Kompleksitas",
                        "Teknologi"
                    ],
                    correct: 1
                },
                {
                    id: 2,
                    question: "Apa itu wireframe dalam UI/UX Design?",
                    options: [
                        "Gambar final produk",
                        "Sketsa dasar layout dan struktur",
                        "Kode program",
                        "Database design"
                    ],
                    correct: 1
                },
                {
                    id: 3,
                    question: "User persona digunakan untuk?",
                    options: [
                        "Memahami target pengguna",
                        "Membuat kode",
                        "Testing aplikasi",
                        "Marketing produk"
                    ],
                    correct: 0
                },
                {
                    id: 4,
                    question: "Apa itu prototyping dalam design process?",
                    options: [
                        "Membuat model awal untuk testing",
                        "Menulis dokumentasi",
                        "Coding aplikasi",
                        "Deployment produk"
                    ],
                    correct: 0
                },
                {
                    id: 5,
                    question: "Accessibility dalam design berarti?",
                    options: [
                        "Design yang dapat diakses oleh semua orang termasuk disabilitas",
                        "Design yang mudah diubah",
                        "Design yang cepat loading",
                        "Design yang murah"
                    ],
                    correct: 0
                }
            ]
        }
    },
    {
        id: 4,
        title: "Backend Development with Node.js",
        description: "Pelajari pengembangan backend menggunakan Node.js, Express, dan database",
        instructor: "Sarah Johnson",
        duration: "12 minggu",
        level: "Intermediate",
        rating: 4.9,
        students: 1876,
        image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=300&h=200&fit=crop&crop=center",
        isEnrolled: true,
        progress: 0,
        introMaterial: {
            title: "Selamat Datang di Backend Development",
            content: [
                {
                    type: "text",
                    content: "Selamat datang di course Backend Development! Dalam course ini, Anda akan mempelajari cara membangun aplikasi backend yang scalable dan secure menggunakan Node.js."
                },
                {
                    type: "text",
                    content: "Course ini mencakup konsep fundamental backend development, RESTful APIs, database integration, authentication, dan deployment."
                },
                {
                    type: "list",
                    items: [
                        "Fundamental Node.js dan JavaScript ES6+",
                        "Express.js framework untuk web applications",
                        "Database integration (MongoDB, PostgreSQL)",
                        "RESTful API design dan implementation",
                        "Authentication dan authorization",
                        "Testing dan debugging techniques",
                        "Deployment dan DevOps basics"
                    ]
                },
                {
                    type: "image",
                    src: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&h=300&fit=crop&crop=center",
                    alt: "Backend Development Architecture",
                    caption: "Arsitektur backend modern dengan microservices"
                },
                {
                    type: "pdf",
                    title: "Node.js Practices Guide",
                    description: "Panduan lengkap best practices untuk Node.js development",
                    url: "https://www.anuragkapur.com/assets/blog/programming/node/PDF-Guide-Node-Andrew-Mead-v3.pdf",
                    downloadUrl: "https://www.anuragkapur.com/assets/blog/programming/node/PDF-Guide-Node-Andrew-Mead-v3.pdf",
                    embedUrl: "https://docs.google.com/viewer?url=https://www.anuragkapur.com/assets/blog/programming/node/PDF-Guide-Node-Andrew-Mead-v3.pdf&embedded=true"
                },
                {
                    type: "external_link",
                    title: "Express.js Official Documentation",
                    description: "Dokumentasi resmi Express.js framework",
                    url: "https://expressjs.com/"
                },
                {
                    type: "video",
                    src: "https://www.youtube.com/embed/fBNz5xF-Kx4",
                    title: "Introduction to Backend Development",
                    duration: "10:15"
                }
            ]
        },
        lessons: [
            {
                id: 1,
                title: "Pengenalan Backend Development",
                type: "mixed",
                content: [
                    {
                        type: "text",
                        content: "# Backend Development Fundamentals\n\nBackend development adalah proses membangun server-side logic, database, dan API yang mendukung aplikasi web dan mobile."
                    },
                    {
                        type: "image",
                        src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=300&fit=crop&crop=center",
                        alt: "Server Architecture",
                        caption: "Arsitektur server modern"
                    },
                    {
                        type: "text",
                        content: "## Komponen Utama Backend\n\n1. **Server**: Menangani request dan response\n2. **Database**: Menyimpan dan mengelola data\n3. **API**: Interface untuk komunikasi dengan frontend\n4. **Authentication**: Sistem keamanan dan otorisasi"
                    },
                    {
                        type: "code",
                        language: "javascript",
                        content: "// Contoh server sederhana dengan Express.js\nconst express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.json({ message: 'Hello Backend!' });\n});\n\napp.listen(3000, () => {\n  console.log('Server running on port 3000');\n});"
                    },
                    {
                        type: "external_link",
                        title: "Node.js Official Website",
                        description: "Pelajari lebih lanjut tentang Node.js runtime",
                        url: "https://nodejs.org/"
                    }
                ]
            },
            {
                id: 2,
                title: "Setting Up Development Environment",
                type: "mixed",
                content: [
                    {
                        type: "text",
                        content: "# Setting Up Node.js Development Environment\n\nUntuk memulai backend development, kita perlu menyiapkan environment yang tepat."
                    },
                    {
                        type: "pdf",
                        title: "Node.js Installation Guide",
                        description: "Panduan lengkap instalasi dan konfigurasi Node.js",
                        url: "https://nodejs.org/dist/latest-v18.x/docs/api/documentation.pdf",
                        downloadUrl: "https://nodejs.org/dist/latest-v18.x/docs/api/documentation.pdf",
                        embedUrl: "https://docs.google.com/viewer?url=https://nodejs.org/dist/latest-v18.x/docs/api/documentation.pdf&embedded=true"
                    },
                    {
                        type: "text",
                        content: "## Prerequisites\n\n1. **Node.js**: Runtime JavaScript untuk server\n2. **npm/yarn**: Package manager\n3. **Code Editor**: VS Code, WebStorm, atau editor favorit\n4. **Database**: MongoDB, PostgreSQL, atau MySQL"
                    },
                    {
                        type: "code",
                        language: "bash",
                        content: "# Verify Installation\nnode --version\nnpm --version\n\n# Create Project\nmkdir my-backend-app\ncd my-backend-app\nnpm init -y"
                    }
                ]
            },
            {
                id: 3,
                title: "Building RESTful APIs",
                type: "mixed",
                content: [
                    {
                        type: "text",
                        content: "# Building RESTful APIs\n\nRESTful API adalah arsitektur untuk membangun web services yang menggunakan HTTP methods untuk operasi CRUD."
                    },
                    {
                        type: "pdf",
                        title: "RESTful API Design Guide",
                        description: "Panduan lengkap desain dan implementasi RESTful API",
                        url: "https://restfulapi.net/wp-content/uploads/REST-API-design-guide.pdf",
                        downloadUrl: "https://restfulapi.net/wp-content/uploads/REST-API-design-guide.pdf",
                        embedUrl: "https://docs.google.com/viewer?url=https://restfulapi.net/wp-content/uploads/REST-API-design-guide.pdf&embedded=true"
                    },
                    {
                        type: "video",
                        src: "https://www.youtube.com/embed/pKd0Rpw7O48",
                        title: "Building RESTful APIs with Express.js",
                        duration: "15:30"
                    },
                    {
                        type: "code",
                        language: "javascript",
                        content: "// Contoh RESTful API dengan Express.js\nconst express = require('express');\nconst app = express();\n\napp.use(express.json());\n\n// GET - Read all users\napp.get('/api/users', (req, res) => {\n  res.json({ users: [] });\n});\n\n// POST - Create new user\napp.post('/api/users', (req, res) => {\n  const { name, email } = req.body;\n  res.json({ id: 1, name, email });\n});\n\n// PUT - Update user\napp.put('/api/users/:id', (req, res) => {\n  const { id } = req.params;\n  const { name, email } = req.body;\n  res.json({ id, name, email });\n});\n\n// DELETE - Delete user\napp.delete('/api/users/:id', (req, res) => {\n  res.json({ message: 'User deleted' });\n});"
                    }
                ]
            }
        ],
        preTest: {
            id: "pre4",
            title: "Pre-Test: Backend Development Fundamentals",
            questions: [
                {
                    id: 1,
                    question: "Node.js adalah?",
                    options: [
                        "Framework JavaScript",
                        "Runtime JavaScript",
                        "Database",
                        "Web Browser"
                    ],
                    correct: 1
                },
                {
                    id: 2,
                    question: "Apa kepanjangan dari API?",
                    options: [
                        "Application Programming Interface",
                        "Advanced Programming Interface",
                        "Automated Programming Interface",
                        "Application Process Interface"
                    ],
                    correct: 0
                },
                {
                    id: 3,
                    question: "HTTP method untuk mengambil data adalah?",
                    options: [
                        "POST",
                        "PUT",
                        "GET",
                        "DELETE"
                    ],
                    correct: 2
                },
                {
                    id: 4,
                    question: "Express.js adalah?",
                    options: [
                        "Database",
                        "Web framework untuk Node.js",
                        "Frontend library",
                        "Testing tool"
                    ],
                    correct: 1
                },
                {
                    id: 5,
                    question: "JSON singkatan dari?",
                    options: [
                        "JavaScript Object Notation",
                        "Java Standard Object Notation",
                        "JavaScript Online Notation",
                        "Java Script Object Network"
                    ],
                    correct: 0
                }
            ]
        },
        postTest: {
            id: "post4",
            title: "Post-Test: Backend Development with Node.js",
            questions: [
                {
                    id: 1,
                    question: "Middleware dalam Express.js berfungsi untuk?",
                    options: [
                        "Styling",
                        "Memproses request sebelum mencapai route handler",
                        "Database connection",
                        "Frontend rendering"
                    ],
                    correct: 1
                },
                {
                    id: 2,
                    question: "HTTP status code 201 menandakan?",
                    options: [
                        "Not Found",
                        "Server Error",
                        "Created",
                        "Unauthorized"
                    ],
                    correct: 2
                },
                {
                    id: 3,
                    question: "RESTful API menggunakan HTTP methods untuk?",
                    options: [
                        "Styling",
                        "CRUD operations",
                        "Authentication only",
                        "File upload only"
                    ],
                    correct: 1
                },
                {
                    id: 4,
                    question: "npm adalah?",
                    options: [
                        "Node Package Manager",
                        "New Programming Method",
                        "Network Protocol Manager",
                        "Node Process Manager"
                    ],
                    correct: 0
                },
                {
                    id: 5,
                    question: "Async/await dalam Node.js digunakan untuk?",
                    options: [
                        "Styling",
                        "Menangani operasi asynchronous",
                        "Database schema",
                        "Frontend routing"
                    ],
                    correct: 1
                },
                {
                    id: 6,
                    question: "Environment variables dalam Node.js biasanya disimpan di?",
                    options: [
                        "package.json",
                        ".env file",
                        "index.js",
                        "node_modules"
                    ],
                    correct: 1
                },
                {
                    id: 7,
                    question: "CORS adalah?",
                    options: [
                        "Cross-Origin Resource Sharing",
                        "Core Object Resource System",
                        "Cross-Origin Request Security",
                        "Core Origin Resource Sharing"
                    ],
                    correct: 0
                },
                {
                    id: 8,
                    question: "JWT singkatan dari?",
                    options: [
                        "Java Web Token",
                        "JavaScript Web Tool",
                        "JSON Web Token",
                        "Java Web Tool"
                    ],
                    correct: 2
                }
            ]
        },
        quiz: {
            questions: [
                {
                    id: 1,
                    question: "Apa kepanjangan dari API?",
                    options: [
                        "Application Programming Interface",
                        "Advanced Programming Interface",
                        "Automated Programming Interface",
                        "Application Process Interface"
                    ],
                    correctAnswer: 0,
                    explanation: "API adalah Application Programming Interface, yaitu interface yang memungkinkan komunikasi antar aplikasi."
                },
                {
                    id: 2,
                    question: "HTTP method mana yang digunakan untuk membuat data baru?",
                    options: [
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE"
                    ],
                    correctAnswer: 1,
                    explanation: "POST digunakan untuk membuat resource baru di server."
                }
            ]
        }
    }
];
const __TURBOPACK__default__export__ = coursesData;
}}),
"[project]/src/utils/localStorage.js [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// localStorage utility functions for course management
// Safe localStorage wrapper for SSR compatibility
__turbopack_context__.s({
    "STORAGE_KEYS": (()=>STORAGE_KEYS),
    "cleanupOrphanedFiles": (()=>cleanupOrphanedFiles),
    "deleteCourse": (()=>deleteCourse),
    "getAllCourses": (()=>getAllCourses),
    "getCourseById": (()=>getCourseById),
    "getCourseProgress": (()=>getCourseProgress),
    "getCourseWithFiles": (()=>getCourseWithFiles),
    "getFromStorage": (()=>getFromStorage),
    "getUserSubmissions": (()=>getUserSubmissions),
    "initializeDefaultData": (()=>initializeDefaultData),
    "removeFromStorage": (()=>removeFromStorage),
    "safeLocalStorage": (()=>safeLocalStorage),
    "saveCourse": (()=>saveCourse),
    "saveCourseProgress": (()=>saveCourseProgress),
    "saveCourseWithFiles": (()=>saveCourseWithFiles),
    "saveUserSubmission": (()=>saveUserSubmission),
    "setToStorage": (()=>setToStorage)
});
const safeLocalStorage = {
    getItem: (key)=>{
        if ("TURBOPACK compile-time falsy", 0) {
            "TURBOPACK unreachable";
        }
        return null;
    },
    setItem: (key, value)=>{
        if ("TURBOPACK compile-time falsy", 0) {
            "TURBOPACK unreachable";
        }
    },
    removeItem: (key)=>{
        if ("TURBOPACK compile-time falsy", 0) {
            "TURBOPACK unreachable";
        }
    }
};
const STORAGE_KEYS = {
    COURSES: 'courses',
    COURSE_PROGRESS: 'agileku_course_progress',
    USER_SUBMISSIONS: 'agileku_user_submissions'
};
const getFromStorage = (key, defaultValue = null)=>{
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key ${key}:`, error);
        return defaultValue;
    }
};
const setToStorage = (key, value)=>{
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.error(`Error writing to localStorage key ${key}:`, error);
        return false;
    }
};
const removeFromStorage = (key)=>{
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error(`Error removing from localStorage key ${key}:`, error);
        return false;
    }
};
const getAllCourses = ()=>{
    const courses = getFromStorage(STORAGE_KEYS.COURSES, []);
    // If no courses in localStorage, try to get from coursesData
    if (courses.length === 0) {
        try {
            const { coursesData } = __turbopack_context__.r("[project]/src/data/coursesData.js [app-ssr] (ecmascript)");
            if (coursesData && coursesData.length > 0) {
                setToStorage(STORAGE_KEYS.COURSES, coursesData);
                return coursesData;
            }
        } catch (error) {
            console.log('No coursesData found, using empty array');
        }
    }
    return courses;
};
const getCourseById = (courseId)=>{
    const courses = getAllCourses();
    return courses.find((course)=>course.id === courseId) || null;
};
const saveCourse = (courseData)=>{
    const courses = getAllCourses();
    const existingIndex = courses.findIndex((course)=>course.id === courseData.id);
    if (existingIndex >= 0) {
        // Update existing course
        courses[existingIndex] = {
            ...courses[existingIndex],
            ...courseData
        };
    } else {
        // Add new course
        const newId = courses.length > 0 ? Math.max(...courses.map((c)=>c.id)) + 1 : 1;
        courses.push({
            ...courseData,
            id: newId
        });
    }
    return setToStorage(STORAGE_KEYS.COURSES, courses);
};
const deleteCourse = (courseId)=>{
    const courses = getAllCourses();
    const filteredCourses = courses.filter((course)=>course.id !== courseId);
    return setToStorage(STORAGE_KEYS.COURSES, filteredCourses);
};
const getCourseProgress = (courseId)=>{
    const progress = getFromStorage(STORAGE_KEYS.COURSE_PROGRESS, {});
    return progress[courseId] || {
        currentStep: 'intro',
        completedSteps: [],
        preTestScore: null,
        postTestScore: null,
        isCompleted: false
    };
};
const saveCourseProgress = (courseId, progressData)=>{
    const allProgress = getFromStorage(STORAGE_KEYS.COURSE_PROGRESS, {});
    allProgress[courseId] = {
        ...allProgress[courseId],
        ...progressData
    };
    return setToStorage(STORAGE_KEYS.COURSE_PROGRESS, allProgress);
};
const getUserSubmissions = (courseId)=>{
    const submissions = getFromStorage(STORAGE_KEYS.USER_SUBMISSIONS, {});
    return submissions[courseId] || {
        postWork: null,
        finalProject: null
    };
};
const saveUserSubmission = (courseId, submissionType, submissionData)=>{
    const allSubmissions = getFromStorage(STORAGE_KEYS.USER_SUBMISSIONS, {});
    if (!allSubmissions[courseId]) {
        allSubmissions[courseId] = {};
    }
    allSubmissions[courseId][submissionType] = {
        ...submissionData,
        submittedAt: new Date().toISOString()
    };
    return setToStorage(STORAGE_KEYS.USER_SUBMISSIONS, allSubmissions);
};
const initializeDefaultData = (defaultCourses = [])=>{
    const existingCourses = getAllCourses();
    if (existingCourses.length === 0 && defaultCourses.length > 0) {
        setToStorage(STORAGE_KEYS.COURSES, defaultCourses);
    }
};
const saveCourseWithFiles = async (courseData)=>{
    try {
        // Save course data to localStorage
        const success = saveCourse(courseData);
        if (success) {
            console.log('Course saved successfully with file references');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error saving course with files:', error);
        return false;
    }
};
const getCourseWithFiles = async (courseId)=>{
    try {
        const course = getCourseById(courseId);
        if (!course) return null;
        // Course data already contains file references (fileId, filename, etc.)
        // The actual file URLs will be generated when needed in components
        return course;
    } catch (error) {
        console.error('Error getting course with files:', error);
        return null;
    }
};
const cleanupOrphanedFiles = async ()=>{
    try {
        const courses = getAllCourses();
        const referencedFileIds = new Set();
        // Collect all file IDs referenced in courses
        courses.forEach((course)=>{
            // Check intro material
            if (course.introMaterial && course.introMaterial.content) {
                course.introMaterial.content.forEach((item)=>{
                    if (item.fileId) {
                        referencedFileIds.add(item.fileId);
                    }
                });
            }
            // Check lessons
            if (course.lessons) {
                course.lessons.forEach((lesson)=>{
                    if (lesson.content && lesson.content.fileId) {
                        referencedFileIds.add(lesson.content.fileId);
                    }
                });
            }
        });
        console.log('Referenced file IDs:', Array.from(referencedFileIds));
        return Array.from(referencedFileIds);
    } catch (error) {
        console.error('Error cleaning up orphaned files:', error);
        return [];
    }
};
;
}}),
"[project]/src/services/api.js [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// API service untuk berkomunikasi dengan backend
__turbopack_context__.s({
    "adminAPI": (()=>adminAPI),
    "announcementAPI": (()=>announcementAPI),
    "apiUtils": (()=>apiUtils),
    "authAPI": (()=>authAPI),
    "certificateAPI": (()=>certificateAPI),
    "courseAPI": (()=>courseAPI),
    "default": (()=>__TURBOPACK__default__export__),
    "getCourseProgress": (()=>getCourseProgress),
    "getLessonProgress": (()=>getLessonProgress),
    "getUserCertificates": (()=>getUserCertificates),
    "getUserEnrollments": (()=>getUserEnrollments),
    "getUserProgressList": (()=>getUserProgressList),
    "progressAPI": (()=>progressAPI),
    "quizAPI": (()=>quizAPI),
    "requestCertificate": (()=>requestCertificate),
    "submissionAPI": (()=>submissionAPI),
    "submitSurveyFeedback": (()=>submitSurveyFeedback),
    "surveyAPI": (()=>surveyAPI),
    "syncProgress": (()=>syncProgress),
    "updateLessonProgress": (()=>updateLessonProgress)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$localStorage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/localStorage.js [app-ssr] (ecmascript)");
;
// API Base URLs for different environments
const PRODUCTION_API_URL = 'https://api.mindshiftlearning.id';
const DEVELOPMENT_API_URL = 'https://api.mindshiftlearning.id';
// Determine current environment and set API base URL
const isDevelopment = ("TURBOPACK compile-time value", "development") === 'development' || "undefined" !== 'undefined' && window.location.hostname === 'localhost';
const API_BASE_URL = ("TURBOPACK compile-time truthy", 1) ? `${"TURBOPACK compile-time value", "https://api.mindshiftlearning.id"}/api` : ("TURBOPACK unreachable", undefined);
// Helper function untuk membuat request dengan error handling
const apiRequest = async (url, options = {})=>{
    try {
        const token = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$localStorage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeLocalStorage"].getItem('authToken');
        const config = {
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...token && {
                    Authorization: `Bearer ${token}`
                },
                ...options.headers
            },
            ...options
        };
        console.log('Making API request to:', `${API_BASE_URL}${url}`);
        console.log('Request config:', config);
        const response = await fetch(`${API_BASE_URL}${url}`, config);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        if (!response.ok) {
            const errorData = await response.json().catch(()=>({}));
            console.error('Error response data:', errorData);
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
        console.log('Response data:', responseData);
        return responseData;
    } catch (error) {
        console.error('API Request Error:', error);
        console.error('Error details:', {
            message: error.message,
            name: error.name,
            stack: error.stack
        });
        // Provide more specific error messages
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
            throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
        }
        throw error;
    }
};
const authAPI = {
    // Login user
    login: async (username, password)=>{
        const response = await apiRequest('/public/login', {
            method: 'POST',
            body: JSON.stringify({
                username,
                password
            })
        });
        // Handle response structure: {success: true, data: {user, token}}
        if (response.success && response.data && response.data.token) {
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$localStorage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeLocalStorage"].setItem('authToken', response.data.token);
            return response; // Return full response with success flag
        }
        return response;
    },
    // Register user
    register: async (userData)=>{
        return await apiRequest('/public/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    // Get current user profile
    getProfile: async ()=>{
        return await apiRequest('/protected/user/profile');
    },
    // Update user profile
    updateProfile: async (userData)=>{
        return await apiRequest('/protected/user/profile', {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    },
    // Change password
    changePassword: async (currentPassword, newPassword)=>{
        return await apiRequest('/protected/user/change-password', {
            method: 'POST',
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });
    },
    // Logout (clear token)
    logout: ()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$localStorage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeLocalStorage"].removeItem('authToken');
    }
};
const submissionAPI = {
    // Upload file - implementasi baru yang sederhana
    uploadFile: async (file)=>{
        const formData = new FormData();
        formData.append('file', file);
        const token = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$localStorage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeLocalStorage"].getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/protected/uploads/file`, {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Upload failed: ${errorText}`);
        }
        return await response.json();
    },
    // Get file by ID
    getFile: async (fileId)=>{
        return await apiRequest(`/protected/uploads/file/${fileId}`);
    },
    // Create postwork submission
    createPostWorkSubmission: async (submissionData)=>{
        return await apiRequest('/protected/submissions/postwork', {
            method: 'POST',
            body: JSON.stringify(submissionData)
        });
    },
    // Get postwork submissions
    getPostWorkSubmissions: async (courseId = null)=>{
        const url = courseId ? `/protected/submissions/postwork?courseId=${courseId}` : '/protected/submissions/postwork';
        return await apiRequest(url);
    },
    // Create final project submission
    createFinalProjectSubmission: async (submissionData)=>{
        return await apiRequest('/protected/submissions/finalproject', {
            method: 'POST',
            body: JSON.stringify(submissionData)
        });
    },
    // Get final project submission
    getFinalProjectSubmission: async (courseId)=>{
        return await apiRequest(`/protected/submissions/finalproject/${courseId}`);
    }
};
const courseAPI = {
    // Get all courses (public)
    getAllCourses: async ()=>{
        return await apiRequest('/public/courses');
    },
    // Get course by ID (public)
    getCourseById: async (courseId)=>{
        return await apiRequest(`/public/courses/${courseId}`);
    },
    // Search courses (public)
    searchCourses: async (query)=>{
        return await apiRequest(`/public/courses/search?q=${encodeURIComponent(query)}`);
    },
    // Get courses with enrollment status (protected)
    getCoursesWithEnrollment: async ()=>{
        return await apiRequest('/protected/courses');
    },
    // Enroll in course (protected)
    enrollInCourse: async (courseId)=>{
        try {
            return await apiRequest('/protected/courses/enroll', {
                method: 'POST',
                body: JSON.stringify({
                    courseId: parseInt(courseId)
                })
            });
        } catch (error) {
            // Handle "Already enrolled" case gracefully
            if (error.message && error.message.includes('Already enrolled')) {
                return {
                    success: true,
                    message: 'Already enrolled'
                };
            }
            throw error;
        }
    },
    // Get user enrollments (protected) - updated to use the fixed endpoint
    getUserEnrollments: async ()=>{
        return await apiRequest('/protected/courses/enrollments');
    },
    // Get pre-test for a course (protected)
    getCoursePreTest: async (courseId)=>{
        return await apiRequest(`/protected/courses/${courseId}/pretest`);
    },
    // Get post-test for a course (protected)
    getCoursePostTest: async (courseId)=>{
        return await apiRequest(`/protected/courses/${courseId}/posttest`);
    },
    // Check stage access (protected)
    checkStageAccess: async (courseId, stageName)=>{
        return await apiRequest(`/protected/courses/${courseId}/stages/${stageName}/access`);
    }
};
const quizAPI = {
    // Get quiz by ID
    getQuiz: async (quizId)=>{
        return await apiRequest(`/protected/quizzes/${quizId}`);
    },
    // Get quizzes by course
    getQuizzesByCourse: async (courseId)=>{
        return await apiRequest(`/protected/courses/${courseId}/quizzes`);
    },
    // Start quiz attempt
    startQuizAttempt: async (quizId)=>{
        return await apiRequest(`/protected/quizzes/${quizId}/start`, {
            method: 'POST'
        });
    },
    // Submit quiz
    submitQuiz: async (submissionData)=>{
        return await apiRequest('/protected/quizzes/submit', {
            method: 'POST',
            body: JSON.stringify(submissionData)
        });
    },
    // Get quiz attempts
    getQuizAttempts: async (quizId)=>{
        return await apiRequest(`/protected/quizzes/${quizId}/attempts`);
    }
};
const apiUtils = {
    // Check if user is authenticated
    isAuthenticated: ()=>{
        return !!__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$localStorage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeLocalStorage"].getItem('authToken');
    },
    // Get stored token
    getToken: ()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$localStorage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeLocalStorage"].getItem('authToken');
    },
    // Clear all auth data
    clearAuthData: ()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$localStorage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeLocalStorage"].removeItem('authToken');
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$localStorage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeLocalStorage"].removeItem('currentUser');
    },
    // Test backend connectivity
    testConnection: async ()=>{
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return response.ok;
        } catch (error) {
            console.error('Backend connectivity test failed:', error);
            return false;
        }
    }
};
const certificateAPI = {
    // Request certificate for course completion
    requestCertificate: async (courseId)=>{
        return await apiRequest(`/protected/courses/${courseId}/certificate`, {
            method: 'POST'
        });
    },
    // Get user certificates
    getUserCertificates: async ()=>{
        return await apiRequest('/protected/user/certificates');
    },
    // Verify certificate by certificate number
    verifyCertificate: async (certNumber)=>{
        return await apiRequest(`/public/certificates/verify/${certNumber}`);
    }
};
const adminAPI = {
    // Course Management
    getAllCourses: async ()=>{
        return await apiRequest('/protected/admin/courses');
    },
    createCourse: async (courseData)=>{
        return await apiRequest('/protected/admin/courses', {
            method: 'POST',
            body: JSON.stringify(courseData)
        });
    },
    updateCourse: async (courseId, courseData)=>{
        return await apiRequest(`/protected/admin/courses/${courseId}`, {
            method: 'PUT',
            body: JSON.stringify(courseData)
        });
    },
    deleteCourse: async (courseId)=>{
        return await apiRequest(`/protected/admin/courses/${courseId}`, {
            method: 'DELETE'
        });
    },
    // Grading System
    createGrade: async (gradeData)=>{
        return await apiRequest('/protected/admin/grading', {
            method: 'POST',
            body: JSON.stringify(gradeData)
        });
    },
    getGrades: async ()=>{
        return await apiRequest('/protected/admin/grading');
    },
    // Submissions Review
    getCourseSubmissions: async (courseId)=>{
        return await apiRequest(`/protected/admin/courses/${courseId}/submissions`);
    },
    // Certificate Management
    getAllCertificates: async ()=>{
        return await apiRequest('/protected/admin/certificates');
    },
    // Get pending certificates (admin only)
    getPendingCertificates: async ()=>{
        return await apiRequest('/protected/admin/certificates/pending');
    },
    // Approve certificate (admin only)
    approveCertificate: async (certificateId)=>{
        return await apiRequest(`/protected/admin/certificates/${certificateId}/approve`, {
            method: 'POST'
        });
    },
    // Reject certificate (admin only)
    rejectCertificate: async (certificateId, reason)=>{
        return await apiRequest(`/protected/admin/certificates/${certificateId}/reject`, {
            method: 'POST',
            body: JSON.stringify({
                reason
            })
        });
    },
    // User Management
    getAllUsers: async ()=>{
        return await apiRequest('/protected/admin/users');
    },
    createUser: async (userData)=>{
        return await apiRequest('/protected/admin/users', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },
    updateUser: async (userId, userData)=>{
        return await apiRequest(`/protected/admin/users/${userId}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    },
    deleteUser: async (userId)=>{
        return await apiRequest(`/protected/admin/users/${userId}`, {
            method: 'DELETE'
        });
    },
    // Announcement Management
    createAnnouncement: async (announcementData)=>{
        return await apiRequest('/protected/admin/announcements', {
            method: 'POST',
            body: JSON.stringify(announcementData)
        });
    },
    getAllAnnouncements: async ()=>{
        return await apiRequest('/protected/admin/announcements');
    },
    getAnnouncementById: async (announcementId)=>{
        return await apiRequest(`/protected/admin/announcements/${announcementId}`);
    },
    // Quiz Management (Admin - no enrollment check)
    getCoursePreTestAdmin: async (courseId)=>{
        return await apiRequest(`/protected/admin/courses/${courseId}/pretest`);
    },
    getCoursePostTestAdmin: async (courseId)=>{
        return await apiRequest(`/protected/admin/courses/${courseId}/posttest`);
    },
    // Quiz CRUD operations
    createQuiz: async (quizData)=>{
        return await apiRequest('/protected/admin/quizzes', {
            method: 'POST',
            body: JSON.stringify(quizData)
        });
    },
    updateQuiz: async (quizId, quizData)=>{
        return await apiRequest(`/protected/admin/quizzes/${quizId}`, {
            method: 'PUT',
            body: JSON.stringify(quizData)
        });
    },
    deleteQuiz: async (quizId)=>{
        return await apiRequest(`/protected/admin/quizzes/${quizId}`, {
            method: 'DELETE'
        });
    },
    getAllQuizzes: async ()=>{
        return await apiRequest('/protected/admin/quizzes');
    },
    updateAnnouncement: async (announcementId, announcementData)=>{
        return await apiRequest(`/protected/admin/announcements/${announcementId}`, {
            method: 'PUT',
            body: JSON.stringify(announcementData)
        });
    },
    deleteAnnouncement: async (announcementId)=>{
        return await apiRequest(`/protected/admin/announcements/${announcementId}`, {
            method: 'DELETE'
        });
    },
    // Dashboard Statistics
    getDashboardStats: async ()=>{
        return await apiRequest('/protected/admin/dashboard/stats');
    },
    // Test Results
    getTestResults: async ()=>{
        return await apiRequest('/protected/admin/test-results');
    },
    // Stage Lock Management
    getStageLocks: async (courseId)=>{
        return await apiRequest(`/protected/admin/courses/${courseId}/stage-locks`);
    },
    updateStageLock: async (courseId, stageLockData)=>{
        return await apiRequest(`/protected/admin/courses/${courseId}/stage-locks`, {
            method: 'PUT',
            body: JSON.stringify(stageLockData)
        });
    }
};
const announcementAPI = {
    // Get announcements for current user based on their role
    getUserAnnouncements: async ()=>{
        return await apiRequest('/protected/announcements');
    }
};
const surveyAPI = {
    // Submit survey feedback
    submitSurveyFeedback: async (surveyData)=>{
        return await apiRequest('/protected/surveys/feedback', {
            method: 'POST',
            body: JSON.stringify(surveyData)
        });
    },
    // Get survey feedback for a course
    getSurveyFeedback: async (courseId)=>{
        return await apiRequest(`/protected/surveys/feedback/${courseId}`);
    }
};
const submitSurveyFeedback = surveyAPI.submitSurveyFeedback;
const progressAPI = {
    // Sync progress data to backend
    syncProgress: async (progressData)=>{
        return await apiRequest('/protected/progress/sync', {
            method: 'POST',
            body: JSON.stringify(progressData)
        });
    },
    // Get course progress for a user
    getCourseProgress: async (courseId)=>{
        return await apiRequest(`/protected/courses/${courseId}/progress`);
    },
    // Update lesson progress
    updateLessonProgress: async (progressData)=>{
        return await apiRequest('/protected/progress/lesson', {
            method: 'POST',
            body: JSON.stringify(progressData)
        });
    },
    // Get lesson progress
    getLessonProgress: async (courseId, lessonId)=>{
        return await apiRequest(`/protected/courses/${courseId}/lessons/${lessonId}/progress`);
    },
    // Get user progress list
    getUserProgressList: async ()=>{
        return await apiRequest('/protected/progress');
    }
};
const syncProgress = progressAPI.syncProgress;
const getCourseProgress = progressAPI.getCourseProgress;
const updateLessonProgress = progressAPI.updateLessonProgress;
const getLessonProgress = progressAPI.getLessonProgress;
const getUserProgressList = progressAPI.getUserProgressList;
const getUserEnrollments = courseAPI.getUserEnrollments;
const getUserCertificates = certificateAPI.getUserCertificates;
const requestCertificate = certificateAPI.requestCertificate;
const __TURBOPACK__default__export__ = {
    auth: authAPI,
    course: courseAPI,
    submission: submissionAPI,
    quiz: quizAPI,
    certificate: certificateAPI,
    admin: adminAPI,
    announcement: announcementAPI,
    survey: surveyAPI,
    progress: progressAPI,
    utils: apiUtils
};
}}),
"[project]/src/contexts/AuthContext.js [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "AuthProvider": (()=>AuthProvider),
    "useAuth": (()=>useAuth)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$localStorage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/utils/localStorage.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/services/api.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createContext"])();
const useAuth = ()=>{
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
// Helper function untuk handle API errors
const handleApiError = (error)=>{
    console.error('API Error:', error);
    return {
        success: false,
        error: error.message || 'Terjadi kesalahan pada server'
    };
};
const AuthProvider = ({ children })=>{
    const [currentUser, setCurrentUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [courses, setCourses] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [enrollments, setEnrollments] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    // Course management functions - defined before useEffect
    const refreshCourses = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        try {
            const coursesData = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["courseAPI"].getAllCourses();
            console.log('Courses data received:', coursesData);
            setCourses(coursesData.data || coursesData.courses || []);
        // Remove localStorage caching
        } catch (error) {
            console.error('Failed to refresh courses:', error);
        }
    }, []);
    const getCourseById = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (courseId)=>{
        try {
            // Always fetch fresh data from backend, no memory cache
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["courseAPI"].getCourseById(courseId);
            // Handle different response formats from backend
            if (response && response.success && response.data) {
                return response.data;
            } else if (response && response.course) {
                return response.course;
            } else if (response && (response.id || response.title)) {
                return response;
            }
            console.warn('Unexpected course response format:', response);
            return null;
        } catch (error) {
            console.error('Failed to get course by ID:', error);
            return null;
        }
    }, []);
    // Load user data and courses on mount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const initializeApp = async ()=>{
            try {
                // Check if user is authenticated and verify with API
                if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiUtils"].isAuthenticated()) {
                    try {
                        const userProfile = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["authAPI"].getProfile();
                        const userData = userProfile.data || userProfile.user || userProfile;
                        setCurrentUser(userData);
                        // Always fetch fresh data from backend, no cache
                        await refreshCourses();
                        // Load user enrollments using the updated API
                        const userEnrollments = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserEnrollments"])();
                        // Process the response from the updated backend
                        let enrollmentsData = [];
                        if (userEnrollments && userEnrollments.data && Array.isArray(userEnrollments.data)) {
                            enrollmentsData = userEnrollments.data;
                        } else if (userEnrollments && Array.isArray(userEnrollments)) {
                            enrollmentsData = userEnrollments;
                        }
                        setEnrollments(enrollmentsData);
                    } catch (error) {
                        console.error('Failed to load user profile:', error);
                        // Clear invalid token and user data
                        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["apiUtils"].clearAuthData();
                        setCurrentUser(null);
                        setEnrollments([]);
                    }
                } else {
                    // No valid token, clear any stored user data
                    setCurrentUser(null);
                    setEnrollments([]);
                }
                // Always load courses from API
                await refreshCourses();
            } catch (error) {
                console.error('Failed to initialize app:', error);
            } finally{
                setIsLoading(false);
            }
        };
        initializeApp();
    }, [
        refreshCourses
    ]);
    const login = async (username, password)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["authAPI"].login(username, password);
            // Check if login was successful and we have user data
            if (response && response.success && response.data && response.data.user && response.data.token) {
                setCurrentUser(response.data.user);
                __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$localStorage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeLocalStorage"].setItem('currentUser', JSON.stringify(response.data.user));
                // Load user enrollments after login using the updated API
                try {
                    const userEnrollments = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserEnrollments"])();
                    // Process the response from the updated backend
                    let enrollmentsData = [];
                    if (userEnrollments && userEnrollments.data && Array.isArray(userEnrollments.data)) {
                        enrollmentsData = userEnrollments.data;
                    } else if (userEnrollments && Array.isArray(userEnrollments)) {
                        enrollmentsData = userEnrollments;
                    }
                    setEnrollments(enrollmentsData);
                } catch (error) {
                    console.error('Failed to load enrollments:', error);
                    setEnrollments([]);
                }
                return {
                    success: true,
                    user: response.data.user
                };
            }
            return {
                success: false,
                error: 'Login gagal'
            };
        } catch (error) {
            return handleApiError(error);
        }
    };
    const logout = ()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["authAPI"].logout();
        setCurrentUser(null);
        setEnrollments([]);
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$localStorage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeLocalStorage"].removeItem('currentUser');
    };
    // Functions moved above useEffect to fix initialization order
    const enrollInCourse = async (courseId)=>{
        if (!currentUser) {
            return {
                success: false,
                error: 'User not logged in'
            };
        }
        // Check if already enrolled
        if (isEnrolledInCourse(courseId)) {
            return {
                success: true,
                message: 'Already enrolled'
            };
        }
        try {
            const result = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["courseAPI"].enrollInCourse(courseId);
            // Refresh enrollments after successful enrollment using the updated API
            const userEnrollments = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserEnrollments"])();
            // Process the response from the updated backend
            let enrollmentsData = [];
            if (userEnrollments && userEnrollments.data && Array.isArray(userEnrollments.data)) {
                enrollmentsData = userEnrollments.data;
            } else if (userEnrollments && Array.isArray(userEnrollments)) {
                enrollmentsData = userEnrollments;
            }
            setEnrollments(enrollmentsData);
            return {
                success: true,
                data: result
            };
        } catch (error) {
            console.error('Enrollment error:', error);
            // Handle "Already enrolled" error gracefully
            if (error.message && error.message.includes('Already enrolled')) {
                // Refresh enrollments to sync state using the updated API
                const userEnrollments = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserEnrollments"])();
                // Process the response from the updated backend
                let enrollmentsData = [];
                if (userEnrollments && userEnrollments.data && Array.isArray(userEnrollments.data)) {
                    enrollmentsData = userEnrollments.data;
                } else if (userEnrollments && Array.isArray(userEnrollments)) {
                    enrollmentsData = userEnrollments;
                }
                setEnrollments(enrollmentsData);
                return {
                    success: true,
                    message: 'Already enrolled'
                };
            }
            return {
                success: false,
                error: error.message
            };
        }
    };
    const searchCourses = async (query)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["courseAPI"].searchCourses(query);
            return response.data || response.courses || [];
        } catch (error) {
            console.error('Failed to search courses:', error);
            // Fallback to local search
            return courses.filter((course)=>course.title.toLowerCase().includes(query.toLowerCase()) || course.description.toLowerCase().includes(query.toLowerCase()));
        }
    };
    const isEnrolledInCourse = (courseId)=>{
        if (!Array.isArray(enrollments)) return false;
        return enrollments.some((enrollment)=>enrollment.id === parseInt(courseId) || enrollment.course_id === parseInt(courseId));
    };
    const getUserProgress = async (courseId)=>{
        if (!Array.isArray(enrollments)) return 0;
        // First check if user is enrolled
        const enrollment = enrollments.find((e)=>e.id === parseInt(courseId) || e.course_id === parseInt(courseId));
        if (!enrollment) return 0;
        // Try to get real-time progress from backend
        try {
            const progressData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCourseProgress"])(courseId);
            if (progressData && progressData.data) {
                return progressData.data.overallProgress || 0;
            }
        } catch (error) {
            console.warn('Failed to get real-time progress, using cached:', error);
        }
        // Fallback to cached progress from enrollment
        return enrollment.progress || 0;
    };
    // Synchronous version for immediate UI updates
    const getUserProgressSync = (courseId)=>{
        if (!Array.isArray(enrollments)) return 0;
        const enrollment = enrollments.find((e)=>e.id === parseInt(courseId) || e.course_id === parseInt(courseId));
        return enrollment ? enrollment.progress || 0 : 0;
    };
    // Refresh user enrollments and progress
    const refreshUserProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async ()=>{
        if (!currentUser) return;
        try {
            const userEnrollments = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getUserEnrollments"])();
            let enrollmentsData = [];
            if (userEnrollments && userEnrollments.data && Array.isArray(userEnrollments.data)) {
                enrollmentsData = userEnrollments.data;
            } else if (userEnrollments && Array.isArray(userEnrollments)) {
                enrollmentsData = userEnrollments;
            }
            // Just set enrollments without fetching individual progress to prevent infinite loops
            // Individual progress will be fetched on-demand when needed
            setEnrollments(enrollmentsData);
        } catch (error) {
            console.error('Failed to refresh user progress:', error);
        }
    }, [
        currentUser
    ]); // Only depend on currentUser to prevent infinite loops
    // Get pre-test for a course
    const getCoursePreTest = async (courseId)=>{
        try {
            // Use admin endpoint if user is admin
            if (currentUser && currentUser.role === 'admin') {
                const { adminAPI } = await __turbopack_context__.r("[project]/src/services/api.js [app-ssr] (ecmascript, async loader)")(__turbopack_context__.i);
                const response = await adminAPI.getCoursePreTestAdmin(courseId);
                return response.data || response;
            } else {
                // Check if user is enrolled, if not, try to enroll first
                if (!isEnrolledInCourse(courseId)) {
                    console.log('User not enrolled in course, attempting auto-enrollment...');
                    await enrollInCourse(courseId);
                }
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["courseAPI"].getCoursePreTest(courseId);
                return response.quiz || response;
            }
        } catch (error) {
            console.error('Failed to get pre-test:', error);
            // If still failing and user is not admin, try admin endpoint as fallback
            if (currentUser && currentUser.role !== 'admin') {
                try {
                    const { adminAPI } = await __turbopack_context__.r("[project]/src/services/api.js [app-ssr] (ecmascript, async loader)")(__turbopack_context__.i);
                    const response = await adminAPI.getCoursePreTestAdmin(courseId);
                    return response.data || response;
                } catch (adminError) {
                    console.error('Admin fallback also failed:', adminError);
                }
            }
            return null;
        }
    };
    // Get post-test for a course
    const getCoursePostTest = async (courseId)=>{
        try {
            // Use admin endpoint if user is admin
            if (currentUser && currentUser.role === 'admin') {
                const { adminAPI } = await __turbopack_context__.r("[project]/src/services/api.js [app-ssr] (ecmascript, async loader)")(__turbopack_context__.i);
                const response = await adminAPI.getCoursePostTestAdmin(courseId);
                return response.data || response;
            } else {
                // Check if user is enrolled, if not, try to enroll first
                if (!isEnrolledInCourse(courseId)) {
                    console.log('User not enrolled in course, attempting auto-enrollment...');
                    await enrollInCourse(courseId);
                }
                const response = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$services$2f$api$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["courseAPI"].getCoursePostTest(courseId);
                return response.quiz || response;
            }
        } catch (error) {
            console.error('Failed to get post-test:', error);
            // If still failing and user is not admin, try admin endpoint as fallback
            if (currentUser && currentUser.role !== 'admin') {
                try {
                    const { adminAPI } = await __turbopack_context__.r("[project]/src/services/api.js [app-ssr] (ecmascript, async loader)")(__turbopack_context__.i);
                    const response = await adminAPI.getCoursePostTestAdmin(courseId);
                    return response.data || response;
                } catch (adminError) {
                    console.error('Admin fallback also failed:', adminError);
                }
            }
            return null;
        }
    };
    // Update course function for admin operations
    const updateCourse = async (courseId, updatedCourse)=>{
        try {
            // Update local state immediately for better UX
            setCourses((prevCourses)=>prevCourses.map((course)=>course.id === courseId ? {
                        ...course,
                        ...updatedCourse
                    } : course));
            // If user is admin, try to update via API
            if (currentUser && currentUser.role === 'admin') {
                const { adminAPI } = await __turbopack_context__.r("[project]/src/services/api.js [app-ssr] (ecmascript, async loader)")(__turbopack_context__.i);
                await adminAPI.updateCourse(courseId, updatedCourse);
            }
            return {
                success: true
            };
        } catch (error) {
            console.error('Failed to update course:', error);
            // Revert local state on error
            await refreshCourses();
            return {
                success: false,
                error: error.message
            };
        }
    };
    // Stage Lock Management Functions
    const getStageLocks = async (courseId)=>{
        try {
            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Only admin can access stage locks');
            }
            const token = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$localStorage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeLocalStorage"].getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            // Use backend URL directly to avoid routing issues
            const backendUrl = ("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : 'https://api.mindshiftlearning.id';
            const response = await fetch(`${backendUrl}/api/protected/admin/courses/${courseId}/stage-locks`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error('Server returned non-JSON response');
            }
            const data = await response.json();
            if (data.success) {
                return {
                    success: true,
                    data: data.data
                };
            } else {
                throw new Error(data.message || 'Failed to fetch stage locks');
            }
        } catch (error) {
            console.error('Error fetching stage locks:', error);
            return {
                success: false,
                error: error.message
            };
        }
    };
    const updateStageLock = async (courseId, stageName, isLocked, lockMessage = '')=>{
        try {
            if (!currentUser || currentUser.role !== 'admin') {
                throw new Error('Only admin can update stage locks');
            }
            const token = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$utils$2f$localStorage$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeLocalStorage"].getItem('authToken');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const requestBody = {
                courseId: parseInt(courseId),
                stageName: stageName,
                isLocked: isLocked,
                lockMessage: lockMessage
            };
            // Use backend URL directly to avoid routing issues
            const backendUrl = ("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : 'https://api.mindshiftlearning.id';
            const response = await fetch(`${backendUrl}/api/protected/admin/courses/${courseId}/stage-locks`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error('Server returned non-JSON response');
            }
            const data = await response.json();
            if (data.success) {
                return {
                    success: true,
                    data: data.data
                };
            } else {
                throw new Error(data.message || 'Failed to update stage lock');
            }
        } catch (error) {
            console.error('Error updating stage lock:', error);
            return {
                success: false,
                error: error.message
            };
        }
    };
    const value = {
        currentUser,
        login,
        logout,
        isLoading,
        courses,
        enrollments,
        refreshCourses,
        getCourseById,
        enrollInCourse,
        searchCourses,
        isEnrolledInCourse,
        getUserProgress,
        getUserProgressSync,
        refreshUserProgress,
        getCoursePreTest,
        getCoursePostTest,
        updateCourse,
        getStageLocks,
        updateStageLock
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/contexts/AuthContext.js",
        lineNumber: 498,
        columnNumber: 5
    }, this);
};
}}),
"[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
"use strict";
if ("TURBOPACK compile-time falsy", 0) {
    "TURBOPACK unreachable";
} else {
    if ("TURBOPACK compile-time falsy", 0) {
        "TURBOPACK unreachable";
    } else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else {
                "TURBOPACK unreachable";
            }
        } else {
            "TURBOPACK unreachable";
        }
    }
} //# sourceMappingURL=module.compiled.js.map
}}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
"use strict";
module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
"use strict";
module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__28a9cd71._.js.map