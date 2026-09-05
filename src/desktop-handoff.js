// Keep the desktop callback separate from the web authentication bootstrap.
if(new URLSearchParams(location.search).has('desktop_callback'))location.replace('./desktop-return.html'+location.search);
