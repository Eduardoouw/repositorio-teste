const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const caption = document.getElementById("caption");
const closeBtn = document.getElementById("closeBtn");
const toggleTheme = document.getElementById("toggleTheme");
// Abre modal ao cliquar em imagem
document.querySelectorAll(".gallery img").forEach(img => {
    img.addEventListener("click", () => {
        modal.style.display = 'block';
        modalImg.src = img.src.replace("/300/200", "/900/600");
        caption.textContent = img.alt;
    });
});
// Fecha modal
closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
});
// Fecha ao cliquar fora da imagem
modal.addEventListener("click", e => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});
// ALtera modo escuro
toggleTheme.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    toggleTheme.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
})