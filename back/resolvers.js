fs = require("fs");

function saveWorld(context) {
  console.info("Sauvegarde du monde de " + context.user);
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
}

function miseAJourArgent(context) {
  let tempsEcoule = Date.now() - parseInt(context.world.lastupdate);
  context.world.products.forEach((product) => {
    const quantite = calcQtProductionforElapseTime(product, tempsEcoule);
    context.world.money += product.revenu * quantite;
  });
  context.world.lastupdate = Date.now().toString();
}

function calcQtProductionforElapseTime(product, tempsEcoule) {
  let nbrProduction = 0;
  if (product.managerUnlocked) {
    if (tempsEcoule - product.timeleft > 0) {
      var nbr = Math.trunc((tempsEcoule - product.timeleft) / product.vitesse);
      nbrProduction = nbr + 1;
      // /!\ on soustrait la vitesse pour avoir le timeleft
      product.timeleft =
        product.vitesse -
        (tempsEcoule - product.timeleft - product.vitesse * nbr);
    } else {
      product.timeleft = product.vitesse - product.timeleft - tempsEcoule;
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
      product.cout *= product.croissance;
      context.world.money -= argentNecessaire;
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
      context.lastupdate = Date.now();
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
  },
};
