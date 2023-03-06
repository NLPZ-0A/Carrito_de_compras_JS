'use strict;'
const cards = document.getElementById('cards');
const items = document.getElementById('items');
const footer = document.getElementById('footer');
const templateCard = document.getElementById('template-card').content;
const templateFooter = document.getElementById('template-footer').content;
const templateCarrito = document.getElementById('template-carrito').content;
const fragment = document.createDocumentFragment();
let carrito = {};

document.addEventListener('DOMContentLoaded',() => {
    fetchData();

    if(localStorage.getItem('carrito')){

        carrito = JSON.parse(localStorage.getItem());
        pintarCarrito();
    }

});

cards.addEventListener('click', e => {

    addCarrito(e);

});

items.addEventListener('click', e => 
    {
        btnAccion(e);
    });

const fetchData = async () => {

    try
        {
            const res = await fetch('api.json');
            const data = await res.json();
            //console.log(data);
            printCards(data);
        } catch(error)
            {
                console.log(error);
            }

};

const printCards = (data) => {
    data.forEach(producto => {

        templateCard.querySelector('h5').textContent = producto.title;
        templateCard.querySelector('p').textContent = producto.precio + "$";
        templateCard.querySelector('img').setAttribute("src", producto.thumbnailUrl);
        templateCard.querySelector('.btn-success').dataset.id = producto.id;

        const clone = templateCard.cloneNode(true);
        fragment.appendChild(clone);
    });

    cards.appendChild(fragment);
};

const addCarrito = e => {
    //console.log(e.target);
    //console.log(e.target.classList.contains('btn-success'));

    if(e.target.classList.contains('btn-success'))
        {
            setCarrito(e.target.parentElement);
        }
        e.stopPropagation();
};


const setCarrito = objeto => {

    const producto = {
        id : objeto.querySelector('.btn-success').dataset.id,
        title : objeto.querySelector('h5').textContent,
        precio : objeto.querySelector('p').textContent,
        cantidad : 1
    };

    //preguntamos si en el carrito ya existe el id del producto, si existe le sumamos uno
    if(carrito.hasOwnProperty(producto.id))
        {
            producto.cantidad = carrito[producto.id].cantidad + 1;
        }
    
    //creamos el index de producto en el carrito, de forma tal que si no existe lo agregamos y 
    //Si  existe lo sobreescribimos
    carrito[producto.id] = {...producto};
    console.log(carrito);
    pintarCarrito();
};

//pinto el agregado del elemento
const pintarCarrito = () => {
    //limpiamos los items

    items.innerHTML = '';

    //convierto a array el objeto y lo itero con un foreach
    Object.values(carrito).forEach(producto => {
        templateCarrito.querySelector('th').textContent = producto.id;
        templateCarrito.querySelectorAll('td')[0].textContent = producto.title;
        templateCarrito.querySelectorAll('td')[1].textContent = producto.cantidad;
        templateCarrito.querySelector('.btn-info').dataset.id = producto.id;
        templateCarrito.querySelector('.btn-danger').dataset.id = producto.id;
        templateCarrito.querySelector('span').textContent = parseFloat(producto.cantidad) * parseFloat(producto.precio);

        const clone = templateCarrito.cloneNode(true);
        fragment.appendChild(clone);
    });

    items.appendChild(fragment);

    pintarFooter();

    localStorage.setItem('carrito', JSON.stringify(carrito));
};

const pintarFooter = () => {

    footer.innerHTML = '';

    if(Object.keys(carrito).length === 0)
        {
            footer.innerHTML = `
                <th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>
            `;

            return ;
        }

        //filtramos la propiedad del objeto cantidad por cada una y lo sumamos al acumulador acc
        const nCantidad = Object.values(carrito).reduce((acc, {cantidad}) => acc + cantidad, 0);
        const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio}) => acc + (parseFloat(cantidad)*parseFloat(precio)), 0);

        
        templateFooter.querySelectorAll('td')[0].textContent = nCantidad;
        templateFooter.querySelector('span').textContent = nPrecio;

        const clone = templateFooter.cloneNode(true);
        fragment.appendChild(clone);
        footer.appendChild(fragment);

        const btnVaciar = document.getElementById('vaciar-carrito');

        //vaciamos el carrito
        btnVaciar.addEventListener('click', () => {

            carrito ={};
            pintarCarrito();

        });
    };

    const btnAccion = e =>{

        //preguntamos que clase tiene el boton que precionamos
        if(e.target.classList.contains('btn-info'))
            {
                const producto = carrito[e.target.dataset.id];
                producto.cantidad++;
                carrito[e.target.dataset.id] = {...producto};
                pintarCarrito();
            }

            if(e.target.classList.contains('btn-danger'))
            {
                console.log('dentro')
                const producto = carrito[e.target.dataset.id];
                //si llego a cero productos de ese indice
                if(producto.cantidad === 0)
                    {//busco el id del producto y delete borra el indice completo
                        delete carrito[e.target.dataset.id];
                    }else
                        {
                            producto.cantidad--;
                        }
                   
                
                pintarCarrito();
            }

            e.stopPropagation();

    };