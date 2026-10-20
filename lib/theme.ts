export const THEME_STORAGE_KEY = "theme";

/** Runs before first paint (inlined in <head>) so a saved theme never flashes.
    Also marks <html class="js"> so scroll-reveal styles only hide content when JS can show it again. */
export const themeInitScript = `(function(){var d=document.documentElement;d.classList.add("js");try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark")d.setAttribute("data-theme",t)}catch(e){}})();`;
