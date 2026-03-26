// Function to registe
// // --- FUNCTION 1: SAVE THE DATA (SIGN UP) ---
// --- 1. دالة التسجيل (Sign Up) ---
function signUp() {
    const email = document.getElementById("signup-email").value;
    const pass = document.getElementById("signup-pass").value;

    if (email !== "" && pass !== "") {
        // حفظ البيانات محليًا (غير آمن، للتجربة فقط)
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userPassword", pass);
        alert("تم التسجيل بنجاح!");
        window.location.href = "signin.html";
    } else {
        alert("الرجاء إدخال البريد الإلكتروني وكلمة المرور.");
    }
}

// --- 2. دالة تسجيل الدخول (Sign In) ---
function signIn() {
    // تأكد أن الـ IDs في الـ HTML هي "username" و "password" كما في صورتك السابقة
    const typedEmail = document.getElementById("username").value;
    const typedPass = document.getElementById("password").value;
    // localStorage check (insecure)
    const storedEmail = localStorage.getItem("userEmail");
    const storedPass = localStorage.getItem("userPassword");

    if (typedEmail === storedEmail && typedPass === storedPass) {
        alert("تم تسجيل الدخول");
        window.location.href = "school.html";
    } else {
        alert("خطأ في البريد الإلكتروني أو كلمة المرور");
    }
}

// small wrappers used by the HTML buttons
function checkLogin() { signIn(); }
function goToSignUp() { window.location.href = 'signup.html'; }