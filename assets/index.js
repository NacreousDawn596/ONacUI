window.addEventListener("load", (el) => {
    document.getElementById("chat").addEventListener("click", (bec) => {
        ["dropdown", "chat", "title"].forEach((item) => {
            document.getElementById(item).classList.add("fade")
        })
        setTimeout(() => {
            document.getElementById("holder").classList.add("hehe")
        }, 100)
        setTimeout(() => {
            document.body.style.backgroundColor = "black"
        }, 900)
        setTimeout(() => {
            window.location.href = "/chat/" + document.getElementById("dropdownMenuButton1").textContent
        }, 1000)
    })
    Array.from(document.getElementsByClassName("dropdown-item")).forEach((item) => {
        item.addEventListener("click", (ec) => {
            document.getElementById("dropdownMenuButton1").textContent = item.dataset.value
            try{
                document.getElementById("chat").classList.remove("notallowed")
            }catch(e){}
        })
    })
})