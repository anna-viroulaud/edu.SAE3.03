import template from "./template.html?raw";
import { htmlToDOM } from "@/lib/utils.js";
import { HeaderView } from "@/ui/header/index.js";
import { FooterView } from "@/ui/footer/index.js";



/**
 * Construit et retourne le layout principal de l'application.
 *
 * @function
 * @returns {DocumentFragment} Le fragment DOM représentant le layout complet.
 *
 * @description
 * - Crée un fragment DOM à partir du template HTML.
 * - Génère le DOM de l'en-tête via HeaderView.dom().
 * - Génère le DOM du pied de page via FooterView.dom().
 * - Remplace le slot nommé "header" par le DOM de l'en-tête.
 * - Remplace le slot nommé "footer" par le DOM du pied de page.
 * - Retourne le fragment DOM finalisé.
 */
export function RootLayout() {
    let layout = htmlToDOM(template);
    let header = HeaderView.dom();
    let footer = FooterView.dom();
    try {
        const headerSlot = layout.querySelector('slot[name="header"]');
        if (headerSlot) headerSlot.replaceWith(header);
        else layout.insertBefore(header, layout.firstChild);

        const footerSlot = layout.querySelector('slot[name="footer"]');
        if (footerSlot) footerSlot.replaceWith(footer);
        else layout.appendChild(footer);
    } catch (e) {
        // Fallback: ensure header/footer exist in layout
        if (!layout.querySelector('header')) layout.insertBefore(header, layout.firstChild);
        if (!layout.querySelector('footer')) layout.appendChild(footer);
    }
    return layout;
}