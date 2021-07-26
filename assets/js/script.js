
let left_ =document.querySelector("#left")
let trigger =document.querySelector(".trigger")
if (window.innerWidth<=750) {
    trigger.addEventListener("click",()=>{
        if (left_.style.width=="0%") {
            left_.style.width="100%";
        }
        else{
            left_.style.width="0%";
        }
        
    })
}