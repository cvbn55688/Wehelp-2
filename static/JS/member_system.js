const member_button = document.querySelector(".member");
const logout_button = document.querySelector(".logout");
const li_div = document.querySelector("nav ul");
const close_button = document.querySelector(".close_img");
const login_page = document.querySelector(".full_screen");
const login_div = document.querySelector(".member_login");
const sign_div = document.querySelector(".signup");
const member_table = document.querySelector(".member_system");
const login_submit = document.querySelector(".member_login button");
const signup_submit = document.querySelector(".signup button");
const signup_button = document.querySelector(".signup_button");
const login_button = document.querySelector(".login_button");
const booking_button = document.querySelector(".member_booking");
const email_regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

member_button.addEventListener("click", show_black_screen);
function show_black_screen(){
  login_page.style.display = "flex"
  login_page.style.animation = "show_member_system 0.5s forwards"
};

close_button.addEventListener("click", close_black_screen);
function close_black_screen(){
  login_page.style.animation = "close_member_system 0.5s forwards"
  setTimeout(() => {
    login_page.style.display = "None"
  }, 500);
};

signup_button.addEventListener("click", show_signup);
function show_signup(){
  login_div.style.display = "None";
  sign_div.style.display = "flex";
};

login_button.addEventListener("click", show_login);
function show_login(){
  login_div.style.display = "flex";
  sign_div.style.display = "None";
};

function erase_message(user_data_form){
    setTimeout(() => {
        document.addEventListener("click", ()=>{
            user_data_form.removeChild(sing_message);
        }, {once : true});
    }, 100);
};

signup_submit.addEventListener("click", singup);
let sing_message = document.createElement("p");
function singup(){
    let user_data_form = document.querySelector(".signup form");
    let user_name = user_data_form[0].value;
    let user_email = user_data_form[1].value;
    let user_password = user_data_form[2].value;
    if (user_name == "" || user_email == "" || user_password == ""){
        sing_message.textContent = "姓名、信箱、密碼皆不可空白";
        sing_message.style.color = "red";
        user_data_form.appendChild(sing_message);
        erase_message(user_data_form);
    }else if(!email_regex.test(user_email)){
        sing_message.textContent = "信箱不符合格式";
        sing_message.style.color = "red";
        user_data_form.appendChild(sing_message);
        erase_message(user_data_form);
    }else{
        fetch(
            `/api/user`, {
                method: "POST",
                body: JSON.stringify({
                name: user_name,
                email: user_email,
                password:  user_password,
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                  },
                })
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            if (data["ok"] == true){
                sing_message.textContent = "註冊成功";
                sing_message.style.color = "green";
                user_data_form.appendChild(sing_message);
                erase_message(user_data_form);
            }else{
                sing_message.textContent = data["message"];
                sing_message.style.color = "red";
                user_data_form.appendChild(sing_message);
                erase_message(user_data_form);
            };
            
        });
    };
    
};

login_submit.addEventListener("click", login);
function login(){
    let user_data_form = document.querySelector(".member_login form");
    let user_email = user_data_form[0].value;
    let user_password = user_data_form[1].value;
    if (user_email == "" || user_password == ""){
        sing_message.textContent = "信箱、密碼皆不可空白";
        sing_message.style.color = "red";
        user_data_form.appendChild(sing_message);
        erase_message(user_data_form);
    }else if(!email_regex.test(user_email)){
        sing_message.textContent = "信箱不符合格式";
        sing_message.style.color = "red";
        user_data_form.appendChild(sing_message);
        erase_message(user_data_form);
    }else{
        fetch(
            `/api/user/auth`, {
                method: "PUT",
                body: JSON.stringify({
                email: user_email,
                password:  user_password,
                }),
                headers: {
                    "Content-type": "application/json; charset=UTF-8",
                },
            })
            .then(function(response) {
                return response.json();
              })
              .then(function (data) {
                if (data["ok"]){
                    alert("登入成功");
                    document.location.href = location.href;
                }else{
                    sing_message.textContent = data["message"];
                    sing_message.style.color = "red";
                    user_data_form.appendChild(sing_message);
                    erase_message(user_data_form);
                };
            });
        
    };
};

function check_login_state(){
    return fetch(
        `/api/user/auth`, {
            method: "GET",
        })
        .then(function(response){
            return response.json();
        })
        .then(function (data) {
            data = data["data"];
            if (data != null){
                user_id = data["id"];
                user_name = data["name"];
                member_button.style.display = "None";
                logout_button.style.display = "block"
                return user_name
            }else if (document.cookie != ""){
                let refresh_token = (document.cookie.split("=")[1].split(';')[0]);
                fetch(
                    `/refresh`, {
                        method: "POST",
                        headers: {
                            'Authorization': `Bearer ${refresh_token} `,
                        },
                    })
                    .then(function(response){
                        return response.json();
                    })
                    .then(function (data){
                        if (data["ok"]){
                            document.location.href = location.href;
                        }else{
                            logout("expired");
                        };
                    });
            }else{
                return "isLogout";
            };
        });
};
check_login_state();

function logout(logout_event){
    fetch(
        `/api/user/auth`, {
            method: "DELETE",
        }
    )
    .then(function(response){
        return response.json();
    })
    .then(function (data) {
        if (logout_event == "user_logout"){
            alert("已成功登出");
        }else{
            alert("登入逾時，請重新登入");
        };
        document.location.href = location.href;
    });
};

logout_button.addEventListener("click", ()=>{
    logout("user_logout");
});

booking_button.addEventListener("click", ()=>{
    let state = check_login_state();
    state.then(function(response){
        if (response == "isLogout"){
            show_black_screen();
        }else{
            document.location.href = "/booking";
        };
    });
});