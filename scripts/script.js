document.getElementById("open-modal-btn").addEventListener("click", function() {
    document.getElementById("my-modal").classList.add("open")
    document.getElementById("my-modal").classList.remove("close")
})


document.getElementById("close-my-modal-btn").addEventListener("click", function() {
    document.getElementById("my-modal").classList.remove("open")
    document.getElementById("my-modal").classList.add("close")
})

function validateForm() {
    var inputs = document.querySelectorAll(".orderForm input[required]");
    for (var i = 0; i < inputs.length; i++) {
        if (!inputs[i].value) {
            return false;
        }
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function () {
    var orderForm = document.querySelector('.orderForm');

    orderForm.addEventListener('submit', function (e) {
        var userConfirmed = confirm('Запись оформлена');
        if (userConfirmed) {
            let itemsInputText = '';
            KORZINA.cartContents.forEach((item) =>{
                itemsInputText += `${item.title} X${item.count} \n`
            })
            document.getElementById('itemsInput').value = itemsInputText;
            document.getElementById('sumInput').value = KORZINA.sum;
        } else {
            e.preventDefault();
        }
    });
});

if(userRole != 'admin'){
    buttons = document.querySelectorAll('.admin-button');
    buttons.forEach((btn) => {
        btn.style.display = "none";
    })
}

if(userLogin == ''){
    document.querySelector('.container2').style.display = "none";
    document.querySelector('.registration').style.display = "none";
}

function left(){
    userLogin = null;
    userRole = 'guest';
}