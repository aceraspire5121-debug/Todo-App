let task2=[]

if (!localStorage.getItem("token")) {
    // Agar token nahi hai, to login page pe bhejo
    window.location.href = "/login.html";
}


document.querySelector(".logout-btn").addEventListener("click",()=>{
    localStorage.removeItem("token")
    window.location.href="/login.html"
})

//const token=localStorage.getItem("token") ye agar karoge to ek constant value ban jayegi jo ki har jagah use hogi , isliye mai har request me fresh token ka use karunga

async function loadtasks() {
    const token = localStorage.getItem("token"); // fresh token har fetch ke liye
    try{
  const data=await fetch("/getting",{
    headers: {
    "Authorization": token
  }
  }) //get request

  if (data.status === 401) {  // token expired ya invalid
            localStorage.removeItem("token");  // purana token remove karo
            window.location.href = "/login.html";  // login page pe redirect
            return;
        }

  const newdata=await data.json() // convert string to object
  task2=newdata;  //newdata will be an array of all documents in your MongoDB Todo collection.
  render()
    }catch(err)
    {
        console.log(err)
    }
  
}

function render()
{
document.querySelector(".taskbox").innerHTML=""; // taskbox khali hote hi uske bachche mar gye sath hi mai eventlisteners bhi mar gye , everything vanished, so you have to mention correct properties which should be there with respective data on localstorage  
    task2.forEach((a)=>{
    const b=document.createElement("div")
   b.innerHTML=`<div class="taskimgparent" data-id="${a.id}">
            <div class="task">
                <div>Task:</div>
                <div><textarea name=""  style="text-decoration:${a.completed ? 'line-through' : 'none'}" class="textt" id="txt">${a.text}</textarea></div>
                <div><input class="check" type="checkbox" ${a.completed ? "checked" : ""}></div>                       
            </div>                                                 
            <div><img class="delete" src="delet.svg" alt=""></div>
            </div>`
 const c= document.querySelector(".taskbox").append(b)
    })
} 

document.querySelector(".taskbox").addEventListener("click",async (e)=>{  // e is click event, e.target= the element which is clicked
if(!e.target.classList.contains("delete"))
return;
const token = localStorage.getItem("token"); // fresh token har fetch ke liye
const taskElement=e.target.closest(".taskimgparent")
const z=Number(taskElement.dataset.id)  // dataset hamesha string deta hai par hame ise task2.id se compare karenge jo ki ek number hai
const index=task2.findIndex(b=>b.id===z) // if matches then return its index 
const res=await fetch("/dele",{method:"DELETE",headers: { "Content-Type": "application/json","Authorization": token}, body: JSON.stringify({id:z})}) 

  if (res.status === 401) {  // token expired ya invalid
            localStorage.removeItem("token");  // purana token remove karo
            window.location.href = "/login.html";  // login page pe redirect
            return;
        }

const newdata=await res.json()
console.log(newdata)
task2=newdata // new array ispr aa gaya hai
render()
})


document.getElementById("btn").addEventListener("click", async ()=>{
   const a= document.querySelector(".t-d").value.trim()
   document.querySelector(".t-d").value=""
   if(a!="")
   {
    const token = localStorage.getItem("token"); // fresh token har fetch ke liye
    const newTask={text:a,id:Date.now(),completed:false}
    try{
       const res= await fetch("/tasks",
            {method:"POST", headers: { "Content-Type": "application/json","Authorization": token }, body: JSON.stringify(newTask)} //string me convert karke bheja kyoki http kebal string allow karta hai
        )

  if (res.status === 401) {  // token expired ya invalid
            localStorage.removeItem("token");  // purana token remove karo
            window.location.href = "/login.html";  // login page pe redirect
            return;
        }

    const data=await res.json() // baha se response me save document aata hai aur bo bhi string ki form me to dubara convert karte hai object me using json()
 task2.push(data)
   render()
    }
 catch(err)
   {
    console.log(err)
   }
}
})
document.querySelector(".t-d").addEventListener("keydown",async (e)=>{
   if (e.key === "Enter"){
    const a= document.querySelector(".t-d").value.trim()
   document.querySelector(".t-d").value=""
   if(a!="")
   {
    const token = localStorage.getItem("token"); // fresh token har fetch ke liye
    const newTask={text:a,id:Date.now(),completed:false}
    try{
       const res= await fetch("/tasks",
            {method:"POST", headers: { "Content-Type": "application/json","Authorization": token }, body: JSON.stringify(newTask)} //string me convert karke bheja kyoki http kebal string allow karta hai
        )

     if (res.status === 401) {  // token expired ya invalid
            localStorage.removeItem("token");  // purana token remove karo
            window.location.href = "/login.html";  // login page pe redirect
            return;
        }

    const data=await res.json() // baha se response me save document aata hai aur bo bhi string ki form me to dubara convert karte hai object me using json()
 task2.push(data)
   render()
    }
 catch(err)
   {
    console.log(err)
   }
}
   }
})

//again using event delegation(one parent one event)

document.querySelector(".taskbox").addEventListener("dblclick",async (e)=>{
    if(!e.target.classList.contains("textt")) // jaha click kia bo agar textt hai to chalo barna return
        return
        const token = localStorage.getItem("token"); // fresh token har fetch ke liye
        const edit=e.target.closest(".taskimgparent")
        const ok=Number(edit.dataset.id) 
        const index=task2.findIndex(b=>b.id===ok)
       const newtext= prompt("Enter new text",task2[index].text)
       if(newtext!=""){
       try{
        const data=await fetch("/update",{method:"PUT", headers: { "Content-Type": "application/json","Authorization": token }, body: JSON.stringify({id:ok,new:newtext})})

          if (data.status === 401) {  // token expired ya invalid
            localStorage.removeItem("token");  // purana token remove karo
            window.location.href = "/login.html";  // login page pe redirect
            return;
        }

        const newdata=await data.json() // string to object/array
        task2[index]=newdata
        render()
       }catch(err)
       {
        console.log("update not happened")
       }
       }
})

//Checkbox

document.querySelector(".taskbox").addEventListener("change",async (e)=>{
    if(!e.target.classList.contains("check")) // jaha click kia bo agar textt hai to chalo barna return
        return
        const token = localStorage.getItem("token"); // fresh token har fetch ke liye
        const edit=e.target.closest(".taskimgparent")
        const ok=Number(edit.dataset.id) 
        const index=task2.findIndex(b=>b.id===ok)
        const b=e.target.checked;
    //    task2[index].completed=e.target.checked
    try{
    const data= await fetch("/checkup",{method:"PUT", headers: { "Content-Type": "application/json","Authorization": token }, body: JSON.stringify({id:ok,bool:b})})

  if (data.status === 401) {  // token expired ya invalid
            localStorage.removeItem("token");  // purana token remove karo
            window.location.href = "/login.html";  // login page pe redirect
            return;
        }

    const newdata=await data.json()
    task2[index]=newdata;
      render()
    }catch(err){
        console.log(err)
    }
})

loadtasks() // render is already called inside loadtasks

