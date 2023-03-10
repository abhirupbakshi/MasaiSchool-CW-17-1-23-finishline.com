import { get_product } from "./modules/products.js"
import { get_user, update_user } from "./modules/users.js"
import { create_UUID } from "./modules/uuid.js";

function update_cart(cart, item)
{
    let not_present = true;
    for(let i = 0; i < cart.length; i++)
    {
        if(cart[i].product_uuid == item.uuid && cart[i].size == selected_size)
        {
            cart[i].quantity++;
            not_present = false;
            break;
        }
    }
    if(not_present)
    {
        let temp = {
            uuid: create_UUID(),
            product_uuid: item.uuid,
            quantity: 1,
            size: selected_size
        };

        cart.push(temp);
    }

    return cart;
}

function display_item(item)
{
    document.querySelector("#image-div img").setAttribute("src", item.img);
    document.querySelector("#rating-div span:first-child").style.setProperty("--rating", item.rating.avg);
    document.querySelector("#rating-div span:last-child").innerText = "(" + item.rating.count + ")";
    document.querySelector("#product-name").innerText = item.name.toUpperCase();
    document.querySelector("#product-brand").innerText = "Brand: " + item.brand;
    document.querySelector("#product-price").innerText = "$" + item.price;

    let parent = document.querySelector("#sizes-div");
    parent.innerHTML = "";
    item.size.forEach(element => {
        let child = document.createElement("span");
        parent.append(child);
        child.innerText = element;
        child.setAttribute("class", "size");
    });

    document.querySelector("#detail-p").innerText = item.description;
    document.querySelector("#rating").innerText = item.rating.avg;
    document.querySelector("#rating-star").style.setProperty("--rating", item.rating.avg);
    document.querySelector("#rating-count").innerHTML = "Total of <b>" + item.rating.count + "</b> have people rated for this";
    document.querySelector("title").innerText = item.name;
}

let loggedin_user = JSON.parse(localStorage.getItem("loggedin-user"));
let user = {};
let selected_size_element = null;
let selected_size = null;



get_product() //Get product based on the query strings uuid
.then(item => 
{
    if(item.length > 1) return;
    item = item[0];

    display_item(item);

    if(loggedin_user != null)
    {
        get_user(loggedin_user)
        .then(_user =>
        {
            user = _user;
            localStorage.setItem("cart", JSON.stringify(user.cart));
        })
        .catch(error =>
        {
            console.error(error);
        })
    }
    else
    {
        user.cart = JSON.parse(localStorage.getItem("cart")) || [];
    }

    document.querySelector("#add-to-cart").addEventListener("click", event =>
    {
        if(selected_size == null)
        {
            alert("Select a product size!");
            return;
        }

        document.querySelector("#add-to-cart").innerText = "ADDING..."

        user.cart = update_cart(user.cart, item);

        localStorage.setItem("cart", JSON.stringify(user.cart));

        if(loggedin_user != null)
        {
            update_user(user)
            .then(data => {
                document.querySelector("#add-to-cart").innerText = "ADDED TO CART!"
                setTimeout(() => 
                {
                    document.querySelector("#add-to-cart").innerText = "ADD TO CART";
                }, 1000)
            })
            .catch(error => {
                console.error(error);
            })
        }
        else
        {
            document.querySelector("#add-to-cart").innerText = "ADDED TO CART!"
            setTimeout(() => 
            {
                document.querySelector("#add-to-cart").innerText = "ADD TO CART";
            }, 1000)
        }
    })

    document.querySelector("#sizes-div").addEventListener("click", event =>
    {
        if(event.target.getAttribute("class") != "size") return;

        if(selected_size_element != null && selected_size_element != event.target)
        {
            selected_size_element.style.backgroundColor = "white";
            selected_size_element.style.color = "black";
        }

        event.target.style.backgroundColor = "#666666"
        event.target.style.color = "white"

        selected_size_element = event.target;
        selected_size = event.target.innerText;
    })

    document.querySelectorAll(".expand-field").forEach(element => {
        element.addEventListener("click", event =>
        {
            event.target.parentElement.parentElement.querySelector(".infos").style.display = "block";
            event.target.parentElement.querySelector(".collapse-field").style.display = "inline";
            event.target.parentElement.querySelector(".expand-field").style.display = "none";
        })
    })

    document.querySelectorAll(".collapse-field").forEach(element => {
        element.addEventListener("click", event =>
        {
            event.target.parentElement.parentElement.querySelector(".infos").style.display = "none";
            event.target.parentElement.querySelector(".collapse-field").style.display = "none";
            event.target.parentElement.querySelector(".expand-field").style.display = "inline";
        })
    })
})
.catch(error =>{
    console.error(error);
})