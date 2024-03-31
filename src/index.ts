import * as htmlparser2 from "htmlparser2";
import {type ChildNode, Document, Element, Text} from "domhandler";

class Apartment {
    wid: string;
    bnr: string;
    address: string;
    rooms: string;
    size: string;
    rent: string;
    heat: string;
    water: string;

    constructor(
        wid: string,
        bnr: string,
        address: string,
        rooms: string,
        size: string,
        rent: string,
        heat: string,
        water: string,
    ) {
        this.wid = wid;
        this.bnr = bnr;
        this.address = address;
        this.rooms = rooms;
        this.size = size;
        this.rent = rent;
        this.heat = heat;
        this.water = water;
    }
}

async function getBellahomes(house: string): Promise<string> {
    const response = await fetch("https://bellahomes.dk/" + house);
    const html = await response.text();
    return html;
} 

function findTable(item: ChildNode): Element | null {
    // check if item is element
    // if not element, then it does not have children
    if (!(item instanceof Element || item instanceof Document)) {
        return null;
    }

    // if item is table, yay!
    if (item instanceof Element && item.name === "table") {
        return item;
    }

    // if not table, check all children
    for (let child of item.children) {
        const result = findTable(child);
        if (result !== null) {
            return result;
        }
    }

    // we tried everything dave.. :(
    return null;
}

function findTableBody(table: Element): Element | null {
    for (let child of table.children) {
        if (child instanceof Element && child.name === "tbody") {
            return child;
        }
    }
    return null;
}

async function getApartments(house: string): Promise<Apartment[] | null>{
    const html = await getBellahomes(house);
    console.log(house, html.length);

    const page = htmlparser2.parseDocument(html);
    const table = findTable(page);
    if (table === null) {
        console.error("Could not find table");
        return null;
    }
    const tbody = findTableBody(table);
    if (tbody === null) {
        console.error("Could not find tablebody");
        return null;
    }
    const apartments: Apartment[] = [];

    for (let tr of tbody.children) {
        if (!(tr instanceof Element && tr.name === "tr")) {
            continue;
        }

        const data: string[] = [];
        for (let td of tr.children) {
            if (td instanceof Element && td.name === "td" && td.firstChild !== null && td.firstChild instanceof Text){
                const textInsideTd = td.firstChild.data;
                data.push(textInsideTd);
            }
        }
        const apartment = new Apartment(data[0], data[1], data[2], data[3], data[4], data[5], data[6], data[7]);
        apartments.push(apartment);
    }
    return apartments;
}


const houses = ["halldorhus", "laxnesshus", "organistens hus", "nadinehus"];
// const houses = ["halldorhus"];

for (let house of houses) {
    const apartments = await getApartments(house);
    console.log(apartments);

}

