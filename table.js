// 1. إعدادات Firebase الخاصة بكِ (من الصورة التي أرسلتِها)
const firebaseConfig = {
  apiKey: "AIzaSyCcjZkKa7gj9XqUMKkd7hkFo6UR4vapcck",
  authDomain: "schoolproject-d6744.firebaseapp.com",
  databaseURL: "https://schoolproject-d6744-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "schoolproject-d6744",
  storageBucket: "schoolproject-d6744.firebasestorage.app",
  messagingSenderId: "672664767431",
  appId: "1:672664767431:web:d8f4430bd485ce416a7e2"
};

// بدء تشغيل Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

function setTodayDate() {
    const el = document.getElementById("todayDate");
    if (!el) return;
    const now = new Date();
    // مثال: 26/3/2026
    const d = now.getDate();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();
    el.textContent = `${d}/${m}/${y}`;
}

setTodayDate();

function getStudentsDbPath() {
    const fromAttr = document.body && document.body.dataset ? document.body.dataset.dbPath : "";
    if (fromAttr && fromAttr.trim()) return fromAttr.trim();
    return "students/main";
}

const studentsRef = database.ref(getStudentsDbPath());

// مصفوفة الطلاب (ستمتلئ من السحابة)
let students = [];
function buildTable(dataList) {
    const tableBody = document.getElementById("tableBody");
    tableBody.innerHTML = ""; // مسح الجدول القديم قبل الرسم
}
// 2. دالة تحديد اللون (حسب شروطك: 9، 15، 21 يوم)
function getAbsentColor(days) {
    if (days >= 21) return "red";
    if (days >= 15) return "orange";
    if (days >= 9)  return "yellow";
    return "white";
}

// 3. دالة بناء الجدول (مع الحفاظ على الخواص التي وضعتِها)
function buildTable(data = students) {
    const tableBody = document.getElementById("tableBody");
    if (!tableBody) return;
    tableBody.innerHTML = ""; 

    // ترتيب عربي أبجدي حسب الاسم (يعتمد على اللغة العربية)
    const collator = new Intl.Collator('ar', { usage: 'sort', sensitivity: 'base', numeric: true });
    const sortedData = [...(data || [])].sort((a, b) =>
        collator.compare(String(a?.name || "").trim(), String(b?.name || "").trim())
    );

    const studentTable = document.getElementById("studentTable");
    // في `school.html` يوجد عمود بعنوان "#"، بينما في صفحات أخرى قد تكون الأعمدة مختلفة.
    const headerTexts = studentTable
        ? Array.from(studentTable.querySelectorAll("thead th")).map(th => (th.textContent || "").trim())
        : [];
    const hasHashColumn = headerTexts.some(t => t === "#" || t.includes("#"));
    const hasDeleteColumn = headerTexts.some(t => t === "حذف" || t.includes("حذف"));

    sortedData.forEach((student, idx) => {
        const rowIndex = idx + 1; // 1-based
        const bgColor = getAbsentColor(student.absentDays);
        const isAbsent = String(student.status || "").toLowerCase() === "absent";
        const statusClass = isAbsent ? "status-toggle is-absent" : "status-toggle";
        const statusText = isAbsent ? "X" : "";

        let row;
        if (hasHashColumn) {
            // school.html: # | الاسم | الحالة | عدد الأيام | حذف
            row = `<tr>
                <td>${rowIndex}</td>
                <td>${student.name}</td>
                <td>
                    <button
                        type="button"
                        class="${statusClass}"
                        aria-label="تغيير الحالة"
                        onclick="toggleStatus('${student.id || ""}', '${isAbsent ? "Absent" : "Present"}')"
                    >${statusText}</button>
                </td>
                <td>${student.absentDays}</td>
                ${hasDeleteColumn ? `<td><button type="button" class="danger" onclick="deleteStudent('${student.id || ""}')">حذف</button></td>` : ``}
            </tr>`;
        } else {
            // absent/sort/export: الاسم | الحالة | أيام الغياب | الإجراءات
            row = `<tr>
                <td>${student.name}</td>
                <td>
                    <button
                        type="button"
                        class="${statusClass}"
                        aria-label="تغيير الحالة"
                        onclick="toggleStatus('${student.id || ""}', '${isAbsent ? "Absent" : "Present"}')"
                    >${statusText}</button>
                </td>
                <td style="background-color: ${bgColor}; color: black; font-weight: bold; text-align: center;">
                    ${student.absentDays}
                </td>
                <td><input type="checkbox"></td>
            </tr>`;
        }

        tableBody.innerHTML += row;
    });
}

async function toggleStatus(studentId, currentStatus) {
    if (!studentId) return;
    const cur = String(currentStatus || "").toLowerCase();
    const nextStatus = cur === "absent" ? "Present" : "Absent";
    try {
        await studentsRef.child(studentId).update({ status: nextStatus });
    } catch (e) {
        console.error(e);
        alert("حدث خطأ أثناء تغيير الحالة");
    }
}

async function deleteStudent(studentId) {
    if (!studentId) return;
    const ok = await confirmModal("هل تريد حذف هذا الاسم؟");
    if (!ok) return;
    try {
        await studentsRef.child(studentId).remove();
    } catch (e) {
        console.error(e);
        alert("حدث خطأ أثناء الحذف");
    }
}

function confirmModal(message) {
    return new Promise((resolve) => {
        removeOldModals();

        const overlay = createOverlay();
        const modal = document.createElement('div');
        modal.className = 'absent-modal confirm-modal';

        modal.innerHTML = `
            <h3>تأكيد</h3>
            <p class="confirm-text">${String(message || "")}</p>
            <div class="modal-actions modal-actions-split">
                <button type="button" class="primary" data-action="yes">نعم</button>
                <button type="button" class="close-btn" data-action="no">إلغاء</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const cleanup = (value) => {
            const existing = document.querySelector('.absent-modal-overlay');
            if (existing) existing.remove();
            resolve(value);
        };

        overlay.addEventListener('click', (e) => {
            const target = e.target;
            if (!(target instanceof HTMLElement)) return;
            const action = target.getAttribute('data-action');
            if (action === 'yes') cleanup(true);
            if (action === 'no') cleanup(false);
        });
    });
}

// 4. دالة إضافة طالب جديد للسحابة
function addNewStudent() {
    const nameInput = document.getElementById("newName");
    if (nameInput && nameInput.value.trim() !== "") {
        studentsRef.push({
            name: nameInput.value.trim(),
            absentDays: 0,
            status: "Present"
        });
        nameInput.value = "";
    } else {
        alert("الرجاء إدخال اسم الطالب أولاً");
    }
}

// 5. استلام البيانات من Firebase وتحديث الجدول فوراً
studentsRef.on('value', (snapshot) => {
    const data = snapshot.val();
    if (data) {
        // تحويل البيانات من Firebase Object إلى Array
        students = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
        }));
        buildTable();
    } else {
        students = [];
        buildTable();
    }
});

// 6. منطق البحث والنوافذ المنبثقة (Modals)
const searchInput =
  document.getElementById('searchBar') || document.getElementById('search');
if (searchInput) {
    searchInput.addEventListener('input', function () {
        const val = this.value.toLowerCase();
        const filtered = students.filter(s => s.name.toLowerCase().includes(val));
        buildTable(filtered);
    });

    searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            const val = this.value.trim().toLowerCase();
            if (!val) return;
            const found = students.find(s => s.name.toLowerCase() === val);
            if (found) showStudentModal(found);
            else showNotFound(this.value.trim());
        }
    });
}

// دالة عرض تفاصيل الطالب
function showStudentModal(student) {
    removeOldModals();
    const overlay = createOverlay();
    const modal = document.createElement('div');
    modal.className = 'absent-modal';
    modal.innerHTML = 
        `<h3>تفاصيل الطالب: ${student.name}</h3>`
        `<p>الحالة: ${student.status}</p>`
        `<p>أيام الغياب: ${student.absentDays}</p>`
        `<button class="close-btn" onclick="this.parentElement.parentElement.remove()">إغلاق</button>`
    ;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// دالة تنبيه "الاسم غير موجود"
function showNotFound(name) {
    removeOldModals();
    const overlay = createOverlay();
    const modal = document.createElement('div');
    modal.className = 'absent-modal';
    modal.innerHTML = 
        `<h3>تنبيه</h3>`
        `<p>لم يتم العثور على اسم: "${name}"</p>`
        `<button class="close-btn" onclick="this.parentElement.parentElement.remove()">إغلاق</button>`
    ;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}
// دوال مساعدة للمودال
function createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'absent-modal-overlay';
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
    return overlay;
}

function removeOldModals() {
    const existing = document.querySelector('.absent-modal-overlay');
    if (existing) existing.remove();
}
function getSelected() {
    removeOldModals();

    const absentStudents = students
        .filter(s => String(s.status || "").toLowerCase() === "absent")
        .map(s => ({ name: String(s.name || "").trim(), absentDays: Number(s.absentDays || 0) }));

    const overlay = createOverlay();
    const modal = document.createElement('div');
    modal.className = 'absent-modal';

    const collator = new Intl.Collator('ar', { usage: 'sort', sensitivity: 'base', numeric: true });
    absentStudents.sort((a, b) => collator.compare(a.name, b.name));

    const rowsHtml = absentStudents.length
        ? absentStudents.map(s => `<tr><td>${s.name}</td><td>${s.absentDays}</td></tr>`).join("")
        : `<tr><td colspan="2">لا يوجد طلاب غائبون حالياً</td></tr>`;

    modal.innerHTML = `
        <h3>قائمة الغائبين</h3>
        <table class="absent-list">
            <thead>
                <tr>
                    <th>الاسم</th>
                    <th>عدد الأيام</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
        <div class="modal-actions">
            <button type="button" class="close-btn" onclick="this.closest('.absent-modal-overlay').remove()">إغلاق</button>
        </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
} 
document.getElementById("newName").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    addNewStudent();
  }
});

/* Sidebar navigation is static; no JS required هنا */