// PrimeVerse Article Database
const PrimeVerseArticles = [
    {
        id: "features",
        title: "Features of a Prime Number",
        description: "Explore the core properties, definitions, and unique characteristics of prime numbers, the building blocks of mathematics.",
        category: "Number Theory",
        author: "Prof. Alan Turing",
        publishDate: "July 1, 2026",
        readingTime: "5 min read",
        difficulty: "Easy",
        views: 1240,
        likes: 145,
        coverImage: "assets/images/features-cover.jpg",
        url: "features.html"
    },
    {
        id: "range",
        title: "Range and Distribution of Prime Numbers",
        description: "Analyze how prime numbers are spread across integers and understand the famous Prime Number Theorem.",
        category: "Advanced Math",
        author: "Ada Lovelace",
        publishDate: "July 4, 2026",
        readingTime: "8 min read",
        difficulty: "Medium",
        views: 980,
        likes: 87,
        coverImage: "assets/images/range-cover.jpg",
        url: "range.html"
    },
    {
        id: "cryptography",
        title: "Prime Numbers in Cryptography: Securing the Internet",
        description: "Delve into how prime factorization forms the foundation of modern cryptography schemes like RSA, protecting your data online.",
        category: "Cryptography",
        author: "Dr. Grace Hopper",
        publishDate: "July 7, 2026",
        readingTime: "12 min read",
        difficulty: "Hard",
        views: 2150,
        likes: 310,
        coverImage: "assets/images/cryptography-cover.jpg",
        url: "cryptography.html"
    },
    {
        id: "sieve",
        title: "Sieve of Eratosthenes: Finding Primes Efficiently",
        description: "Understand the ancient yet highly efficient algorithm for finding all prime numbers up to a specified limit, with code illustrations.",
        category: "Algorithms",
        author: "Katherine Johnson",
        publishDate: "July 8, 2026",
        readingTime: "6 min read",
        difficulty: "Medium",
        views: 1420,
        likes: 198,
        coverImage: "assets/images/sieve-cover.jpg",
        url: "sieve.html"
    }
];

// Helper to retrieve articles
function getArticleById(id) {
    return PrimeVerseArticles.find(article => article.id === id);
}

// Get related articles (same category or random)
function getRelatedArticles(currentId, limit = 3) {
    const current = getArticleById(currentId);
    let filtered = PrimeVerseArticles.filter(article => article.id !== currentId);
    
    if (current) {
        // Prioritize same category
        const sameCategory = filtered.filter(article => article.category === current.category);
        const otherCategory = filtered.filter(article => article.category !== current.category);
        filtered = [...sameCategory, ...otherCategory];
    }
    
    return filtered.slice(0, limit);
}
