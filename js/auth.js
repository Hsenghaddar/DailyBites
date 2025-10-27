let signpPageButton = document.querySelector(".signupPageBtn")
let loginPageButton = document.querySelector(".loginPageBtn")
let loginform = document.querySelector(".loginBtn")
let loginForm=document.querySelector(".loginForm")
let signupForm=document.querySelector(".signupForm")
let loginSection = document.querySelector(".login")
let signUpSection = document.querySelector(".signup")
let loginEmailInput = document.querySelector('.login .email');
let loginPasswordInput = document.querySelector('.login .password');
let signupEmailInput = document.querySelector('.signup .email');
let username=document.querySelector(".username")
let signPasswordInput = document.querySelector('.signup .password');
let loginError =document.querySelector(".login .error")
let signupError=document.querySelector(".signup .error")
let showPass=document.querySelectorAll(".show-pass")
let hidePass=document.querySelectorAll(".hide-pass")

signpPageButton.addEventListener("click", () => {
    loginSection.style.display = "none"
    signUpSection.style.display = "flex"
    loginError.style.display="none"
})
loginPageButton.addEventListener("click", () => {
    loginSection.style.display = "flex"
    signUpSection.style.display = "none"
    signupError.style.display="none"
})
loginForm.addEventListener("submit", (e) => {
    e.preventDefault()
    if(loginEmailInput.value.trim() == "" || loginPasswordInput.value.trim()== ""){
        loginError .textContent="Please enter all required fields!"
        loginError .style.display="block"
        return
    }
    fetch('../js/data.json')
        .then(res => res.json())
        .then(data => {
            const users = data.users;
            const foundUser = users.find(user => user.email === loginEmailInput.value && user.password === loginPasswordInput.value);
            if (foundUser) {
                window.location.href="../html/home.html"
            } else {
                loginError .textContent="Incorrect email or password!"
                loginError .style.display="block"
                loginEmailInput.value=""
                loginPasswordInput.value=""
            }
        })
        .catch(err => console.error('error fetching users:', err));
})

signupForm.addEventListener("submit",(e)=>{
    e.preventDefault()
    if(username.value.trim()=="" || signupEmailInput.value.trim()=="" || signPasswordInput.value.trim()==""){
        signupError.textContent="Please enter all required fields!"
        signupError.style.display="block"
        return
    }
    if(signPasswordInput.value.length<8){
        signupError.textContent="Password must be at least 8 characters"
        signupError.style.display="block"
        return
    }
    window.location.href="../html/home.html"
})

showPass.forEach(e=>e.addEventListener("click",(e)=>{
    e.target.style.display="none"
    e.target.nextElementSibling.style.display="block"
    e.target.previousElementSibling.type="password"
}))
hidePass.forEach(e=>e.addEventListener("click",(e)=>{
    e.target.style.display="none"
    e.target.previousElementSibling.style.display="block"
    e.target.previousElementSibling.previousElementSibling.type="text"

}))