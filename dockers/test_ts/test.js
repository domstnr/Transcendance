/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   test.js                                            :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: kenny <kenny@student.42.fr>                +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2026/04/02 01:07:31 by kenny             #+#    #+#             */
/*   Updated: 2026/04/02 02:33:56 by kenny            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

const assert = require('assert');

function Guerrier(nom)
{
    this.nom = nom;
}

Guerrier.prototype.saluer = function ()
{
    console.log(`je te salut cher ami ${this.nom}`);
};

const g1 = new Guerrier("Abe Ekang");
const g2 = new Guerrier("Tayc");

console.log(g1.saluer === g2.saluer);
g2.saluer();
//onsole.log ( `on lance la fonction saluer ici : ${g2.saluer()}`);