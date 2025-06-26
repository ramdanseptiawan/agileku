export const coursesData = [
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
          content: "Selamat datang di kursus Introduction to React! Dalam kursus ini, Anda akan mempelajari dasar-dasar pengembangan aplikasi web menggunakan React, salah satu library JavaScript paling populer saat ini."
        },
        {
          type: "text",
          content: "React dikembangkan oleh Facebook dan digunakan oleh ribuan perusahaan di seluruh dunia untuk membangun aplikasi web yang interaktif dan responsif."
        },
        {
          type: "image",
          src: "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=600&h=300&fit=crop&crop=center",
          alt: "React Development Environment",
          caption: "React ecosystem dan tools yang akan dipelajari"
        },
        {
          type: "text",
          content: "Apa yang akan Anda pelajari:"
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
          src: "https://www.youtube.com/embed/Ke90Tje7VS0",
          title: "Pengenalan React - Overview",
          duration: "5:30"
        }
      ]
    },
    lessons: [
      {
        id: 1,
        title: "Pengenalan React",
        type: "reading",
        content: `
# Pengenalan React

React adalah library JavaScript yang dikembangkan oleh Facebook untuk membangun user interface yang interaktif dan efisien.

## Apa itu React?

React adalah library JavaScript yang berfokus pada pembuatan komponen UI yang dapat digunakan kembali. React menggunakan konsep Virtual DOM untuk meningkatkan performa aplikasi.

## Fitur Utama React

1. **Component-Based**: Membangun aplikasi dengan komponen yang dapat digunakan kembali
2. **Virtual DOM**: Meningkatkan performa dengan minimal DOM manipulation
3. **JSX**: Sintaks yang memungkinkan penulisan HTML di dalam JavaScript
4. **One-Way Data Flow**: Data mengalir dari parent ke child component

## Keunggulan React

- **Performance**: Virtual DOM membuat aplikasi lebih cepat
- **Reusability**: Komponen dapat digunakan kembali
- **Community**: Ekosistem yang besar dan aktif
- **Learning Curve**: Relatif mudah dipelajari

## Kapan Menggunakan React?

React cocok untuk:
- Single Page Applications (SPA)
- Aplikasi dengan UI yang kompleks
- Aplikasi yang membutuhkan performa tinggi
- Proyek dengan tim yang besar

Mari mulai membangun aplikasi React yang amazing!
        `
      },
      {
        id: 2,
        title: "Video Tutorial React Basics",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/Ke90Tje7VS0",
        duration: "20:15"
      }
    ],
    preTest: {
      id: "pre1",
      title: "Pre-Test: React Fundamentals",
      questions: [
        {
          id: 1,
          question: "React dikembangkan oleh?",
          options: ["Google", "Facebook", "Microsoft", "Apple"],
          correct: 1
        },
        {
          id: 2,
          question: "Apa kepanjangan dari JSX?",
          options: ["JavaScript XML", "Java Syntax Extension", "JSON XML", "JavaScript Extension"],
          correct: 0
        },
        {
          id: 3,
          question: "React adalah?",
          options: ["Framework", "Library", "Database", "Server"],
          correct: 1
        },
        {
          id: 4,
          question: "Apa itu component dalam React?",
          options: ["Fungsi atau class yang mengembalikan JSX", "Database", "CSS file", "HTML file"],
          correct: 0
        }
      ]
    },
    postTest: {
      id: "post1",
      title: "Post-Test: React Fundamentals",
      questions: [
        {
          id: 1,
          question: "Virtual DOM dalam React berfungsi untuk?",
          options: ["Styling", "Meningkatkan performa", "Database", "Testing"],
          correct: 1
        },
        {
          id: 2,
          question: "Komponen dalam React sebaiknya?",
          options: ["Besar dan kompleks", "Kecil dan dapat digunakan kembali", "Hanya satu per aplikasi", "Tidak perlu dipisah"],
          correct: 1
        },
        {
          id: 3,
          question: "useState adalah?",
          options: ["Hook untuk mengelola state", "Component", "Props", "Event handler"],
          correct: 0
        },
        {
          id: 4,
          question: "Props dalam React digunakan untuk?",
          options: ["Mengirim data dari parent ke child component", "Styling", "Database connection", "Routing"],
          correct: 0
        },
        {
          id: 5,
          question: "useEffect digunakan untuk?",
          options: ["Side effects dan lifecycle methods", "Styling", "State management", "Routing"],
          correct: 0
        },
        {
          id: 6,
          question: "Apa itu key prop dalam React?",
          options: ["Identifier unik untuk list items", "Password", "CSS class", "Event handler"],
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
# JavaScript Advanced Concepts

JavaScript adalah bahasa pemrograman yang sangat powerful dengan banyak fitur advanced yang perlu dikuasai.

## Closures

Closure adalah fungsi yang memiliki akses ke variabel di scope luar bahkan setelah fungsi luar selesai dieksekusi.

\`\`\`javascript
function outerFunction(x) {
  return function innerFunction(y) {
    return x + y;
  };
}

const addFive = outerFunction(5);
console.log(addFive(3)); // Output: 8
\`\`\`

## Prototypes

JavaScript menggunakan prototype-based inheritance yang berbeda dari class-based inheritance.

\`\`\`javascript
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  return \`Hello, I'm \${this.name}\`;
};

const john = new Person('John');
console.log(john.greet()); // Hello, I'm John
\`\`\`

## Asynchronous Programming

Memahami Promises, async/await, dan event loop adalah kunci untuk menguasai JavaScript modern.

\`\`\`javascript
// Promise example
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
}
\`\`\`
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
# JavaScript Design Patterns

Design patterns adalah solusi yang telah terbukti untuk masalah umum dalam pengembangan software.

## Module Pattern

Pattern ini memungkinkan enkapsulasi dan privacy dalam JavaScript.

\`\`\`javascript
const MyModule = (function() {
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
})();
\`\`\`

## Observer Pattern

Pattern ini memungkinkan objek untuk memberitahu objek lain tentang perubahan state.

\`\`\`javascript
class EventEmitter {
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
}
\`\`\`
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
          options: ["Fungsi yang tertutup", "Fungsi yang memiliki akses ke scope luar", "Fungsi tanpa parameter", "Fungsi yang tidak return"],
          correct: 1
        },
        {
          id: 2,
          question: "Apa perbedaan antara let dan var?",
          options: ["Tidak ada perbedaan", "let memiliki block scope, var memiliki function scope", "var lebih modern", "let tidak bisa diubah"],
          correct: 1
        },
        {
          id: 3,
          question: "Apa itu hoisting dalam JavaScript?",
          options: ["Mengangkat variabel ke atas", "Menghapus variabel", "Mengubah tipe data", "Membuat fungsi baru"],
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
          options: ["Class", "Prototype", "Interface", "Module"],
          correct: 1
        },
        {
          id: 2,
          question: "Apa itu Promise dalam JavaScript?",
          options: ["Objek untuk menangani operasi asynchronous", "Fungsi biasa", "Tipe data primitif", "Method array"],
          correct: 0
        },
        {
          id: 3,
          question: "Async/await adalah?",
          options: ["Syntax untuk menangani Promise", "Tipe data baru", "Framework JavaScript", "Library eksternal"],
          correct: 0
        },
        {
          id: 4,
          question: "Apa itu destructuring dalam JavaScript?",
          options: ["Menghancurkan objek", "Mengekstrak nilai dari array/objek", "Membuat array baru", "Menghapus properti"],
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
          options: ["User Interface", "User Integration", "Universal Interface", "Unified Interface"],
          correct: 0
        },
        {
          id: 2,
          question: "UX adalah singkatan dari?",
          options: ["User Experience", "User Extension", "Universal Experience", "User Execution"],
          correct: 0
        },
        {
          id: 3,
          question: "Apa perbedaan utama antara UI dan UX?",
          options: ["UI fokus pada tampilan, UX fokus pada pengalaman", "Tidak ada perbedaan", "UI lebih penting dari UX", "UX hanya untuk mobile"],
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
          options: ["Estetika", "Usability", "Kompleksitas", "Teknologi"],
          correct: 1
        },
        {
          id: 2,
          question: "Apa itu wireframe dalam UI/UX Design?",
          options: ["Gambar final produk", "Sketsa dasar layout dan struktur", "Kode program", "Database design"],
          correct: 1
        },
        {
          id: 3,
          question: "User persona digunakan untuk?",
          options: ["Memahami target pengguna", "Membuat kode", "Testing aplikasi", "Marketing produk"],
          correct: 0
        },
        {
          id: 4,
          question: "Apa itu prototyping dalam design process?",
          options: ["Membuat model awal untuk testing", "Menulis dokumentasi", "Coding aplikasi", "Deployment produk"],
          correct: 0
        },
        {
          id: 5,
          question: "Accessibility dalam design berarti?",
          options: ["Design yang dapat diakses oleh semua orang termasuk disabilitas", "Design yang mudah diubah", "Design yang cepat loading", "Design yang murah"],
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
          title: "Node.js Best Practices Guide",
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
          options: ["Framework JavaScript", "Runtime JavaScript", "Database", "Web Browser"],
          correct: 1
        },
        {
          id: 2,
          question: "Apa kepanjangan dari API?",
          options: ["Application Programming Interface", "Advanced Programming Interface", "Automated Programming Interface", "Application Process Interface"],
          correct: 0
        },
        {
          id: 3,
          question: "HTTP method untuk mengambil data adalah?",
          options: ["POST", "PUT", "GET", "DELETE"],
          correct: 2
        },
        {
          id: 4,
          question: "Express.js adalah?",
          options: ["Database", "Web framework untuk Node.js", "Frontend library", "Testing tool"],
          correct: 1
        },
        {
          id: 5,
          question: "JSON singkatan dari?",
          options: ["JavaScript Object Notation", "Java Standard Object Notation", "JavaScript Online Notation", "Java Script Object Network"],
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
          options: ["Styling", "Memproses request sebelum mencapai route handler", "Database connection", "Frontend rendering"],
          correct: 1
        },
        {
          id: 2,
          question: "HTTP status code 201 menandakan?",
          options: ["Not Found", "Server Error", "Created", "Unauthorized"],
          correct: 2
        },
        {
          id: 3,
          question: "RESTful API menggunakan HTTP methods untuk?",
          options: ["Styling", "CRUD operations", "Authentication only", "File upload only"],
          correct: 1
        },
        {
          id: 4,
          question: "npm adalah?",
          options: ["Node Package Manager", "New Programming Method", "Network Protocol Manager", "Node Process Manager"],
          correct: 0
        },
        {
          id: 5,
          question: "Async/await dalam Node.js digunakan untuk?",
          options: ["Styling", "Menangani operasi asynchronous", "Database schema", "Frontend routing"],
          correct: 1
        },
        {
          id: 6,
          question: "Environment variables dalam Node.js biasanya disimpan di?",
          options: ["package.json", ".env file", "index.js", "node_modules"],
          correct: 1
        },
        {
          id: 7,
          question: "CORS adalah?",
          options: ["Cross-Origin Resource Sharing", "Core Object Resource System", "Cross-Origin Request Security", "Core Origin Resource Sharing"],
          correct: 0
        },
        {
          id: 8,
          question: "JWT singkatan dari?",
          options: ["Java Web Token", "JavaScript Web Tool", "JSON Web Token", "Java Web Tool"],
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
          options: ["GET", "POST", "PUT", "DELETE"],
          correctAnswer: 1,
          explanation: "POST digunakan untuk membuat resource baru di server."
        }
      ]
    }
  }
];

export default coursesData;