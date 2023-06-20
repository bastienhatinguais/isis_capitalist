fs = require("fs");
const world = require("./world.ts");

function saveWorld(context) {
  console.info("Sauvegarde du monde de " + context.user);
  try {
    fs.writeFile(
      `userworlds/${context.user}-world.json`,
      JSON.stringify(context.world),
      (err) => {
        if (err) {
          console.error(err);
          throw new Error(`Erreur d'écriture du monde coté serveur`);
        }
      }
    );
  } catch (e) {
    console.log(e);
  }
}

function miseAJourArgent(context) {
  let tempsEcoule = Date.now() - parseInt(context.world.lastupdate);
  context.world.products.forEach((product) => {
    const quantite = calcQtProductionforElapseTime(product, tempsEcoule);
    const moneyMade =
      product.revenu *
      quantite *
      (1 + (context.world.activeangels * context.world.angelbonus) / 100);
    context.world.money += moneyMade;
    context.world.score += moneyMade;
  });
  context.world.lastupdate = Date.now().toString();
}

function calcQtProductionforElapseTime(product, tempsEcoule) {
  let nbrProduction = 0;
  if (product.managerUnlocked) {
    if (tempsEcoule > this.product.timeleft) {
      var nbr = Math.trunc((tempsEcoule - product.timeleft) / product.vitesse);
      nbrProduction = nbr * product.quantite + 1;
      // /!\ on soustrait la vitesse pour avoir le timeleft
      product.timeleft =
        product.vitesse -
        (tempsEcoule - product.timeleft - product.vitesse * nbr);
    } else {
      product.timeleft = product.timeleft - tempsEcoule;
    }
  } else if (product.timeleft != 0) {
    // En cours de production manuelle
    if (product.timeleft < tempsEcoule) {
      nbrProduction = product.quantite;
      product.timeleft = 0;
    } else {
      product.timeleft -= tempsEcoule;
    }
  }
  return nbrProduction;
}

function calcUpgrade(palier, product) {
  // On ajoute l'unlock ou l'upgrade
  switch (palier.typeratio) {
    case "vitesse":
      product.vitesse /= palier.ratio;
      product.timeleft /= palier.ratio;
      break;
    case "gain":
      product.revenu *= palier.ratio;
      break;
    default:
      throw "Le type de ratio " + palier.typeratio + " n'existe pas !";
  }
}

module.exports = {
  Query: {
    getWorld(parent, args, context) {
      miseAJourArgent(context);
      saveWorld(context);
      return context.world;
    },
  },
  Mutation: {
    acheterQtProduit(parent, args, context) {
      miseAJourArgent(context);
      let product = context.world.products.find((p) => p.id == args.id);
      if (!product) {
        throw new Error(`Le produit avec l'id ${args.id} n'existe pas.`);
      }
      if (args.quantite <= 0) {
        return product;
      }
      const argentNecessaire =
        (product.cout * (1 - Math.pow(product.croissance, args.quantite))) /
        (1 - product.croissance);
      // On vérifie aussi côté back
      if (argentNecessaire > context.world.money) {
        throw new Error(`Vous n'avez pas assez d'argent pour faire cet achat.`);
      }
      product.quantite += args.quantite;
      product.cout *= Math.pow(product.croissance, product.quantite);
      context.world.money -= argentNecessaire;

      // On vérifie les allUnlocks
      context.world.allunlocks.forEach((allUnlock) => {
        if (
          !allUnlock.unlocked &&
          context.world.products.filter((p) => p.quantite < allUnlock.seuil)
            .length == 0
        ) {
          context.world.products.forEach((p) => calcUpgrade(allUnlock, p));
          allUnlock.unlocked = true;
        }
      });

      // On vérifie les unlocks
      product.paliers.forEach((p) => {
        if (!p.unlocked && product.quantite >= p.seuil) {
          calcUpgrade(p, product);
        }
      });
      saveWorld(context);
      return product;
    },
    lancerProductionProduit(parent, args, context) {
      miseAJourArgent(context);
      let product = context.world.products.find((p) => p.id == args.id);
      if (!product) {
        throw new Error(`Le produit avec l'id ${args.id} n'existe pas.`);
      }
      product.timeleft = product.vitesse;
      saveWorld(context);
      return product;
    },
    engagerManager(parent, args, context) {
      miseAJourArgent(context);
      let manager = context.world.managers.find((m) => m.name == args.name);
      if (!manager) {
        throw new Error(`Le manager avec le nom ${args.name} n'existe pas.`);
      }
      let product = context.world.products.find((p) => p.id == manager.idcible);
      if (!product) {
        throw new Error(
          `Le produit avec l'id ${manager.idcible} n'existe pas lors de l'achat du manager ${manager.name}.`
        );
      }
      // Traitement du prix ?
      if (context.world.money < manager.cout) {
        throw new Error(
          `Vous n'avez pas assez d'argent pour acheter le manager ${manager.name}.`
        );
      }
      context.world.money -= manager.cout;
      product.managerUnlocked = true;
      product.timeleft = product.vitesse;
      manager.unlocked = true;
      saveWorld(context);
      return manager;
    },
    acheterCashUpgrade(parent, args, context) {
      miseAJourArgent(context);
      let upgrade = context.world.upgrades.find((u) => u.name == args.name);
      if (!upgrade) {
        throw new Error(`L'upgrade de nom ${args.name} n'existe pas.`);
      }
      // Traitement du prix ? allez au cas où
      if (context.world.money < upgrade.seuil) {
        throw new Error(
          `Vous n'avez pas assez d'argent pour acheter l'upgrade ${upgrade.name}.`
        );
      }
      context.world.money -= upgrade.seuil;
      if (upgrade.idcible === 0) {
        // Pour tous les produits
        context.world.products.forEach((p) => calcUpgrade(upgrade, p));
      } else {
        let produit = context.world.products[upgrade.idcible - 1];
        calcUpgrade(upgrade, produit);
      }
      upgrade.unlocked = true;
      saveWorld(context);
      return upgrade;
    },

    resetWorld(parent, args, context) {
      miseAJourArgent(context);
      const angelToClaim =
        Math.floor(150 * Math.sqrt(context.world.score / Math.pow(10, 15))) -
        context.world.totalangels;
      const score = context.world.score;
      const totalangels = angelToClaim + context.world.totalangels;
      const activeangels = angelToClaim + context.world.activeangels;
      context.world = {
        ...world,
        score: score,
        totalangels: totalangels,
        activeangels: activeangels,
      };
      saveWorld(context);
      return upgrade;
    },
    acheterAngelUpgrade(parent, args, context) {
      miseAJourArgent(context);
      let upgrade = context.world.angelupgrades.find(
        (u) => u.name == args.name
      );
      if (!upgrade) {
        throw new Error(`L'angel upgrade de nom ${args.name} n'existe pas.`);
      }

      if (context.world.activeangels < upgrade.seuil) {
        throw new Error(
          `Vous n'avez pas assez d'argent pour acheter l'upgrade ${upgrade.name}.`
        );
      }
      context.world.activeangels -= upgrade.seuil;
      if (upgrade.idcible === 0) {
        // Bonus pour tous les produits
        context.world.products.forEach((p) => calcUpgrade(upgrade, p));
      } else if (upgrade.idcible === -1 && upgrade.typeratio === "ange") {
        context.world.angelbonus += upgrade.ratio;
      }
      upgrade.unlocked = true;
      saveWorld(context);
      return upgrade;
    },
  },
};
