module.exports = {
  resolveRelativeCoordinates: function(catalog) {
    let sources = ['Shisma', 'Maynard', 'Johnson', 'judgement rites', 'DS9', 'ENT', 'DIS', 'VOY', 'Mandel', 'sto', 'Mandel-2018'];
    let coordinates = ['x', 'y', 'z'];

     for(let thing in catalog) {
      for(let entryType of sources) {
        if(entryType in catalog[thing] && catalog[thing][entryType].coordinates && catalog[thing][entryType].coordinates.hasOwnProperty('relative-to') ) {
          
          let rela = catalog[thing][entryType].coordinates['relative-to'];
          for(let coordinate of coordinates) {
            if(coordinate in catalog[thing][entryType].coordinates) {
              catalog[thing][entryType].coordinates[coordinate] = 
                catalog[thing][entryType].coordinates[coordinate] + 
                catalog[rela]['Mandel'].coordinates[coordinate];
            }
          }
        }
      }
    }
    return catalog;
  },
  maynardOffset: {
    x: 23.9,
    y: 61.8,
    z: 0,
  },
  addPreferredValues: function(catalog) {
    let priorities = ['Shisma', 'DS9', 'ENT', 'DIS', 'VOY', 'Mandel_2018', 'Mandel', 'sto', 'Maynard', 'Johnson', 'judgement rites'];
    for(let thing in catalog) {
      for(let source of priorities) {
        if (catalog[thing][source]) {
          Object.assign(catalog[thing], catalog[thing][source]);
          break;
        }
      }
    }
    return catalog;
  },
  swichXAndY: function(c) {
    return {
      x: c.y*-1,
      y: c.x*-1,
      z: c.z
    }
  },
  pcToLj: function(p) {
    return p * 3.26156; 
  },
  normalizeCoordinates: function(catalog) {
    let maynardEntries = ['Maynard', 'Johnson', 'judgement rites'];
    let coordinates = ['x', 'y', 'z'];
    
    for(let thing in catalog) {
      for(let entryType of maynardEntries) {
        if(entryType in catalog[thing] && catalog[thing][entryType].coordinates && !catalog[thing][entryType].hasOwnProperty('normalized') ) {
          for(let coordinate of coordinates) {
            if(coordinate in catalog[thing][entryType].coordinates) {
              let point = catalog[thing][entryType].coordinates[coordinate] - this.maynardOffset[coordinate];
              catalog[thing][entryType].coordinates[coordinate] = this.pcToLj(point);
              catalog[thing][entryType].coordinates.normalized = true;
            }
          }
          catalog[thing][entryType].coordinates = this.swichXAndY(catalog[thing][entryType].coordinates);
        }
      }
    }
    return catalog;
  },
  process: function(input) {
    let catalog = this.normalizeCoordinates(input);
    let catalog2 = this.resolveRelativeCoordinates(catalog);
    let catalog3 = this.addPreferredValues(catalog2);
    return catalog3;
  }
}