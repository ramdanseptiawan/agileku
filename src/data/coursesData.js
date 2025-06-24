export const courses = [
  {
    id: 1,
    title: "Pengenalan Pemrograman JavaScript",
    description: "Pelajari dasar-dasar JavaScript dari nol hingga mahir",
    image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=200&fit=crop",
    lessons: [
      {
        id: 1,
        title: "Pengenalan JavaScript",
        type: "reading",
        content: `
# Pengenalan JavaScript

JavaScript adalah bahasa pemrograman yang sangat populer dan banyak digunakan untuk pengembangan web. Bahasa ini awalnya dikembangkan untuk membuat halaman web menjadi lebih interaktif.

![JavaScript Logo](https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&h=300&fit=crop)

## Sejarah JavaScript

JavaScript pertama kali dibuat oleh Brendan Eich di Netscape pada tahun 1995. Meskipun namanya mirip dengan Java, JavaScript adalah bahasa yang berbeda dengan sintaks dan konsep yang unik.

[INFOGRAPHIC: Timeline Perkembangan JavaScript](https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=500&fit=crop)

## Mengapa Belajar JavaScript?

1. **Versatile**: Dapat digunakan untuk frontend, backend, mobile, dan desktop
2. **Popular**: Bahasa pemrograman paling populer di dunia
3. **Community**: Memiliki komunitas yang besar dan aktif
4. **Career**: Banyak peluang karir dengan gaji yang menarik

![JavaScript Ecosystem](https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=700&h=400&fit=crop)

## Konsep Dasar

JavaScript adalah bahasa yang:
- **Interpreted**: Tidak perlu dikompilasi
- **Dynamic**: Tipe data ditentukan saat runtime
- **Prototype-based**: Menggunakan prototype untuk inheritance
- **High-level**: Abstraksi tinggi dari mesin

[INFOGRAPHIC: Karakteristik JavaScript](https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop)

Mari kita mulai perjalanan belajar JavaScript yang menarik ini!
        `
      },
      {
        id: 2,
        title: "Video Tutorial JavaScript Basics",
        type: "video",
        videoUrl: "https://www.youtube.com/embed/W6NZfCO5SIk",
        duration: "15:30"
      }
    ],
    preTest: {
      id: "pre1",
      title: "Pre-Test: JavaScript Basics",
      questions: [
        {
          id: 1,
          question: "JavaScript pertama kali dibuat oleh siapa?",
          options: ["Brendan Eich", "Douglas Crockford", "John Resig", "Ryan Dahl"],
          correct: 0
        },
        {
          id: 2,
          question: "JavaScript adalah bahasa pemrograman yang bersifat?",
          options: ["Compiled", "Interpreted", "Assembly", "Machine Code"],
          correct: 1
        }
      ]
    },
    postTest: {
      id: "post1",
      title: "Post-Test: JavaScript Basics",
      questions: [
        {
          id: 1,
          question: "Apa keunggulan utama JavaScript?",
          options: ["Hanya untuk web", "Versatile dan populer", "Sulit dipelajari", "Tidak memiliki komunitas"],
          correct: 1
        },
        {
          id: 2,
          question: "JavaScript menggunakan sistem inheritance berbasis?",
          options: ["Class", "Prototype", "Interface", "Module"],
          correct: 1
        }
      ]
    }
  },
  {
    id: 2,
    title: "React JS Fundamentals",
    description: "Kuasai React JS untuk membangun aplikasi web modern",
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop",
    lessons: [
      {
        id: 3,
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
      }
    ],
    preTest: {
      id: "pre2",
      title: "Pre-Test: React Fundamentals",
      questions: [
        {
          id: 1,
          question: "React dikembangkan oleh?",
          options: ["Google", "Facebook", "Microsoft", "Apple"],
          correct: 1
        }
      ]
    },
    postTest: {
      id: "post2",
      title: "Post-Test: React Fundamentals",
      questions: [
        {
          id: 1,
          question: "Virtual DOM dalam React berfungsi untuk?",
          options: ["Styling", "Meningkatkan performa", "Database", "Testing"],
          correct: 1
        }
      ]
    }
  },
  {
    id: 3,
    title: "Node.js Backend Development",
    description: "Bangun aplikasi backend yang scalable dengan Node.js",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=200&fit=crop",
    lessons: [
      {
        id: 4,
        title: "Pengenalan Node.js",
        type: "reading",
        content: `
# Pengenalan Node.js

Node.js adalah runtime environment JavaScript yang memungkinkan kita menjalankan JavaScript di server.

## Apa itu Node.js?

Node.js dibangun di atas V8 JavaScript engine Chrome dan menggunakan event-driven, non-blocking I/O model yang membuatnya ringan dan efisien.

## Keunggulan Node.js

1. **Fast**: Dibangun di atas V8 engine yang sangat cepat
2. **Scalable**: Event-driven architecture yang sangat scalable
3. **NPM**: Package manager terbesar di dunia
4. **JavaScript Everywhere**: Satu bahasa untuk frontend dan backend

## Kapan Menggunakan Node.js?

Node.js cocok untuk:
- Real-time applications (chat, gaming)
- API dan microservices
- Single Page Applications
- Streaming applications

Mari mulai membangun aplikasi backend yang powerful!
        `
      }
    ],
    preTest: {
      id: "pre3",
      title: "Pre-Test: Node.js Basics",
      questions: [
        {
          id: 1,
          question: "Node.js dibangun di atas engine apa?",
          options: ["SpiderMonkey", "V8", "Chakra", "JavaScriptCore"],
          correct: 1
        }
      ]
    },
    postTest: {
      id: "post3",
      title: "Post-Test: Node.js Basics",
      questions: [
        {
          id: 1,
          question: "Apa keunggulan utama Node.js?",
          options: ["Synchronous", "Event-driven dan non-blocking", "Hanya untuk frontend", "Sulit dipelajari"],
          correct: 1
        }
      ]
    }
  }
];