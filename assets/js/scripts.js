var body = document.querySelector('body');
var menuTrigger = document.querySelector('#toggle-menu-main-mobile');
var menuContainer = document.querySelector('#menu-main-mobile');
var menuClose = document.querySelector('#close-menu-mobile');

if (menuTrigger !== null) {
  menuTrigger.addEventListener('click', function(e) {
    menuContainer.classList.add('open');
    body.classList.add('lock-scroll');
  });
}

if (menuClose !== null) {
  menuClose.addEventListener('click', function(e) {
    menuContainer.classList.remove('open');
    body.classList.remove('lock-scroll');
  });
}
