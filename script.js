const WHATSAPP_NUMBER = "923372523171";

const categories = [
  {
    id: "oil-pickles",
    title: "Oil Pickles",
    subtitle: "Traditional Shikarpuri flavour, rich and full of character.",
    products: [
      "Mix Oil Super", "Mango Oil Super", "Chilli Oil Super", "Lemon Oil Super",
      "Lasooda Oil Super", "Carrot Oil Super", "Mango Kutra Oil", "Onion Oil Super",
      "Bheh Oil Super", "Chola Oil Super", "Murgh Oil Super", "Ginger Oil Super",
      "Garlic Oil Super", "Lemon Pani Super", "Khatta Meetha Super"
    ]
  },
  {
    id: "vinegar-pickles",
    title: "Vinegar Pickles",
    subtitle: "A tangy collection made for lovers of classic achar.",
    products: [
      "Mix Vinegar Super", "Mango Vinegar Super", "Kutra Vinegar Super",
      "Chilli Vinegar Super", "Lasooda Vinegar Super", "Carrot Vinegar Super",
      "Onion Vinegar Super"
    ]
  },
  {
    id: "export-quality",
    title: "Export Quality Pickles",
    subtitle: "A special selection from the Shikarpuri Legacy range.",
    products: [
      "Mix Oil Export Quality", "Mango Oil Export Quality", "Lemon Oil Export Quality",
      "Chilli Oil Export Quality", "Qurma Oil Export Quality"
    ]
  },
  {
    id: "chutneys",
    title: "Chutneys",
    subtitle: "Sweet, tangy and savoury favourites to complete your meal.",
    products: [
      "Chutney Khatti Meethi", "Chutney Imli", "Green Chutney", "Alu Bukhara", "Aam Meethi"
    ]
  },
  {
    id: "murabbas",
    title: "Murabbas",
    subtitle: "Traditional sweet preserves with a taste of heritage.",
    products: [
      "Murabba Amla", "Murabba Saib", "Murabba Hareer", "Murabba Gajar", "Murabba Bamboo"
    ]
  }
];

function whatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const nav = document.getElementById("categoryNav");
const sections = document.getElementById("categorySections");

categories.forEach((category, categoryIndex) => {
  const navLink = document.createElement("a");
  navLink.href = `#${category.id}`;
  navLink.textContent = category.title;
  nav.append(navLink);

  const section = document.createElement("section");
  section.className = "category-section";
  section.id = category.id;

  const heading = document.createElement("div");
  heading.className = "category-heading";
  const eyebrow = document.createElement("p");
  eyebrow.className = "eyebrow";
  eyebrow.textContent = `Our collection · 0${categoryIndex + 1}`;
  const title = document.createElement("h2");
  title.textContent = category.title;
  const subtitle = document.createElement("p");
  subtitle.className = "category-subtitle";
  subtitle.textContent = category.subtitle;
  heading.append(eyebrow, title, subtitle);

  const grid = document.createElement("div");
  grid.className = "product-grid";

  category.products.forEach((productName, index) => {
    const card = document.createElement("article");
    card.className = "product-card";
    const visual = document.createElement("div");
    visual.className = `product-visual visual-${categoryIndex + 1}`;
    visual.setAttribute("aria-hidden", "true");
    const jar = document.createElement("span");
    jar.className = "jar-mark";
    jar.textContent = "SL";
    visual.append(jar);

    const number = document.createElement("span");
    number.className = "product-number";
    number.textContent = String(index + 1).padStart(2, "0");
    const name = document.createElement("h3");
    name.textContent = productName;
    const pack = document.createElement("p");
    pack.className = "pack-size";
    pack.textContent = categoryIndex < 3 ? "Available packs: 400g · 800g" : "Available pack: 1kg";
    const order = document.createElement("a");
    order.className = "order-link";
    order.href = whatsappLink(`Assalam-o-Alaikum! I am interested in ${productName} from Shikarpuri Legacy Pickles. Please share the price and availability.`);
    order.target = "_blank";
    order.rel = "noopener noreferrer";
    order.textContent = "Enquire on WhatsApp ↗";
    card.append(visual, number, name, pack, order);
    grid.append(card);
  });

  section.append(heading, grid);
  sections.append(section);
});

document.querySelectorAll("[data-wa]").forEach((link) => {
  link.href = whatsappLink("Assalam-o-Alaikum! I would like to enquire about Shikarpuri Legacy Pickles. Please share your product catalogue and delivery details.");
});

document.getElementById("year").textContent = new Date().getFullYear();
