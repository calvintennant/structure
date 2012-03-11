var three = new Object;

/**
 * Function that initates 3d/three.js
 */
function initiate3d() {
  (function ($) {
    
    // container
    container = $('#mc-3d .canvas-wrapper');
    container.empty();
    
    // renderer
    var renderer = new THREE.WebGLRenderer();
    renderer.setSize(container.innerWidth(), container.innerHeight());

    $('#mc-3d .canvas-wrapper').append( renderer.domElement );

    // scene
    var scene = new THREE.Scene();

    // camera
    var camera = new THREE.PerspectiveCamera(45, container.innerWidth() / container.innerHeight(), 1, 1000);
    scene.add(camera);

    // add subtle ambient lighting
    var ambientLight = new THREE.AmbientLight(0x555555);
    scene.add(ambientLight);

    // add directional light source
    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // create wrapper object that contains three.js objects
    three = {
        renderer: renderer,
        camera: camera,
        scene: scene
    };
    
    // array used to store three.js mesh objects for later use
    // as opposed to regenerating them every time
    three.meshCache = new Object();
    
    three.structure = new THREE.Geometry();
    
    /**
     * @param x
     * @param y
     * @param z
     * @return Three.js Materials
     * Function 
     */
    three.getBlockMaterials = function(x, y, z) {
      return spriteMapper(
        blockTexture(schematic.getBlockId(x, y, z))
      );
    }
    
    /**
     * @param x
     * @param y
     * @param z
     * @return Three.js object representing cube at position x,y,z
     */
    three.generateBlockObject = function(x, y, z) {
      this.meshCache[schematic.getBlockId(x, y, z)] = new THREE.Mesh(
        new THREE.CubeGeometry(
          16, 16, 16,
          1, 1, 1,
          this.getBlockMaterials(x, y, z)
        ),
        new THREE.MeshFaceMaterial(),
        false
      );
    }
    
    /**
     * @param x
     * @param y
     * @param z
     * 
     * Function removes block from position x,y,z
     */
    three.removeBlockFromScene = function(x, y, z) {
      if (schematic.getBlockId(x, y, z) != 0) {
        var Cube = this.generateBlockObject(x, y, z);
        three.scene.remove(Cube);
      }
    }
    
    /**
     * @param x
     * @param y
     * @param z
     * 
     * Function adds block to position x,y,z. 
     * Removes any block in it's place
     */
    three.addBlockToScene = function(x, y, z) {
      blockId = schematic.getBlockId(x, y, z);
      
      if ( blockId != 0 ) {
        // first check if we already have a mesh for this id cached
        // if we don't, then generate one
        if ( this.meshCache[blockId] == undefined) {
          this.generateBlockObject(x, y, z);
        }

        this.meshCache[blockId].position = {x:x*16, y:y*16, z:z*16};
        THREE.GeometryUtils.merge(three.structure, this.meshCache[blockId]);
      }
    }
    
    three.addSchematicToScene = function() {
      var xLimit = schematic.getSizeX();
      var yLimit = schematic.getSizeY();
      var zLimit = schematic.getSizeZ();
      
      for (var xRow = 0; xRow < xLimit; xRow++) {
        for (var yRow = 0; yRow < yLimit; yRow++) {
          for (var zRow = 0; zRow < zLimit; zRow++) {
            this.addBlockToScene(xRow, yRow, zRow);
          }
        }
      }
      var mesh = new THREE.Mesh( three.structure, new THREE.MeshFaceMaterial() );
      scene.add( mesh );
    }
    
    animate();
    
  })(jQuery); 
}

/* 
 * Animate THREE.Scene
 */
function animate() {
  requestAnimationFrame( animate );
  render();
}

/*
 * Render THREE.Scene
 */
function render() {
  var timer = new Date().getTime() * 0.0005;
  // position of camera determined by size of schematic
  var distance = ((schematic.getSizeX() + schematic.getSizeZ() + schematic.getSizeY())/3)*16;
  three.camera.position.y = distance;
  three.camera.position.x = Math.sin( timer ) * distance;
  three.camera.position.z = Math.cos( timer ) * distance;
  three.camera.lookAt({
    x:(schematic.getSizeX()*16)/2,
    y:0,
    z:(schematic.getSizeZ()*16)/2
  });

  //controls.update();
  three.renderer.render( three.scene, three.camera );
}


/**
 * @param paramaters as object
 * @return materials as three.js object
 *  
 *  Prepare the object in 
 *  the following format:
 *  
 *  material = spriteMapper({
 *    image: 'sprite.png',
 *    imageSize: 256, // size of image in px (must be square)
 *    spriteSize: 16, // size of sprite in px (must be square)
 *    sides:{
 *      left:{
 *        spriteX: 8, // number of sprites from the left
 *        spriteY: 0  // number of sprites from the top
 *      },
 *      right:{
 *        spriteX: 8,
 *        spriteY: 0
 *      },
 *      top:{
 *        spriteX: 9,
 *        spriteY: 0
 *      },
 *      bottom:{
 *        spriteX: 10,
 *        spriteY: 0
 *      },
 *      front:{
 *        spriteX: 8,
 *        spriteY: 0
 *      },
 *      back:{
 *        spriteX: 8,
 *        spriteY: 0
 *      }
 *    }
 *  });
 * 
 */

function spriteMapper(paramaters) {
  materials = new Array();
  for (side in paramaters.sides) {
    texture           = THREE.ImageUtils.loadTexture('/' + Drupal.settings.structurePath + '/' + paramaters.image);
    texture.wrapS     = THREE.ClampToEdgeWrapping;
    texture.wrapT     = THREE.ClampToEdgeWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.repeat.x  = paramaters.spriteSize /  paramaters.imageSize;
    texture.repeat.y  = paramaters.spriteSize /  paramaters.imageSize;
    texture.offset.x  = paramaters.sides[side].spriteX / ( paramaters.imageSize  / paramaters.spriteSize );
    texture.offset.y  = paramaters.sides[side].spriteY / ( paramaters.imageSize / paramaters.spriteSize );
    materials.push(new THREE.MeshLambertMaterial( {map:texture, transparent: true} ));
  }
  return materials;
}

/**
 * @param blockId as integer
 * @return object paramaters as required by spriteMapper()
 *  
 */
function blockTexture(blockId) {
  switch (blockId) {

    case 2: //Grass
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 3,
              spriteY: 0
          },
          right:{
              spriteX: 3,
              spriteY: 0
          },
          top:{
              spriteX: 0,
              spriteY: 0
          },
          bottom:{
              spriteX: 2,
              spriteY: 0
          },
          front:{
              spriteX: 3,
              spriteY: 0
          },
          back:{
              spriteX: 3,
              spriteY: 0
          }
        }
      }

    case 17: //Wood
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 4,
              spriteY: 1
          },
          right:{
              spriteX: 4,
              spriteY: 1
          },
          top:{
              spriteX: 5,
              spriteY: 1
          },
          bottom:{
              spriteX: 5,
              spriteY: 1
          },
          front:{
              spriteX: 4,
              spriteY: 1
          },
          back:{
              spriteX: 4,
              spriteY: 1
          }
        }
      }

    //case 17:1: //Wood (Pine)
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 4,
              spriteY: 7
          },
          right:{
              spriteX: 4,
              spriteY: 7
          },
          top:{
              spriteX: 5,
              spriteY: 1
          },
          bottom:{
              spriteX: 5,
              spriteY: 1
          },
          front:{
              spriteX: 4,
              spriteY: 7
          },
          back:{
              spriteX: 4,
              spriteY: 7
          }
        }
      }

    //case 17:2: //Wood (Birch)
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 5,
              spriteY: 7
          },
          right:{
              spriteX: 5,
              spriteY: 7
          },
          top:{
              spriteX: 5,
              spriteY: 1
          },
          bottom:{
              spriteX: 5,
              spriteY: 1
          },
          front:{
              spriteX: 5,
              spriteY: 7
          },
          back:{
              spriteX: 5,
              spriteY: 7
          }
        }
      }

    case 23: //Dispenser
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 13,
              spriteY: 2
          },
          right:{
              spriteX: 13,
              spriteY: 2
          },
          top:{
              spriteX: 14,
              spriteY: 3
          },
          bottom:{
              spriteX: 14,
              spriteY: 3
          },
          front:{
              spriteX: 14,
              spriteY: 2
          },
          back:{
              spriteX: 13,
              spriteY: 2
          }
        }
      }

    case 26: //bed
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 6,
              spriteY: 9
          },
          right:{
              spriteX: 8,
              spriteY: 9
          },
          top:{
              spriteX: 6,
              spriteY: 8
          },
          bottom:{
              spriteX: 8,
              spriteY: 8
          },
          front:{
              spriteX: 8,
              spriteY: 10
          },
          back:{
              spriteX: 5,
              spriteY: 10
          }
        }
      }

    case 29: //Sticky Piston
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 12,
              spriteY: 6
          },
          right:{
              spriteX: 12,
              spriteY: 6
          },
          top:{
              spriteX: 10,
              spriteY: 6
          },
          bottom:{
              spriteX: 13,
              spriteY: 6
          },
          front:{
              spriteX: 12,
              spriteY: 6
          },
          back:{
              spriteX: 12,
              spriteY: 6
          }
        }
      }

    case 33: //Piston
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 12,
              spriteY: 6
          },
          right:{
              spriteX: 12,
              spriteY: 6
          },
          top:{
              spriteX: 11,
              spriteY: 6
          },
          bottom:{
              spriteX: 13,
              spriteY: 6
          },
          front:{
              spriteX: 12,
              spriteY: 6
          },
          back:{
              spriteX: 12,
              spriteY: 6
          }
        }
      }

    case 46: //TNT
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 8,
              spriteY: 0
          },
          right:{
              spriteX: 8, 
              spriteY: 0
          },
          top:{
              spriteX: 9, 
              spriteY: 0
          },
          bottom:{
              spriteX: 10,
              spriteY: 0
          },
          front:{
              spriteX: 8, 
              spriteY: 0
          },
          back:{
              spriteX: 8, 
              spriteY: 0
          }
        }
      }

    case 47: //Bookshelf
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 3,
              spriteY: 2
          },
          right:{
              spriteX: 3,
              spriteY: 2
          },
          top:{
              spriteX: 4,
              spriteY: 0
          },
          bottom:{
              spriteX: 4,
              spriteY: 0
          },
          front:{
              spriteX: 3,
              spriteY: 2
          },
          back:{
              spriteX: 3,
              spriteY: 2
          }
        }
      }

    case 50: //torch 
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 0,
              spriteY: 5
          },
          right:{
              spriteX: 0,
              spriteY: 5
          },
          top:{
              spriteX: 0,
              spriteY: 5
          },
          bottom:{
              spriteX: 0,
              spriteY: 5
          },
          front:{
              spriteX: 0,
              spriteY: 5
          },
          back:{
              spriteX: 0,
              spriteY: 5
          }
        }
      }

    case 54: //Chest
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 10,
              spriteY: 1
          },
          right:{
              spriteX: 10,
              spriteY: 1
          },
          top:{
              spriteX: 9, 
              spriteY: 1
          },
          bottom:{
              spriteX: 9, 
              spriteY: 1
          },
          front:{
              spriteX: 11,
              spriteY: 1
          },
          back:{
              spriteX: 10,
              spriteY: 1
          }
        }
      }

    case 58: //Crafting Table
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 11,
              spriteY: 3
          },
          right:{
              spriteX: 12,
              spriteY: 3
          },
          top:{
              spriteX: 11,
              spriteY: 2
          },
          bottom:{
              spriteX: 11,
              spriteY: 2
          },
          front:{
              spriteX: 11,
              spriteY: 3
          },
          back:{
              spriteX: 12,
              spriteY: 3
          }
        }
      }

    case 61: //Furnace
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 13,
              spriteY: 2
          },
          right:{
              spriteX: 13,
              spriteY: 2
          },
          top:{
              spriteX: 14,
              spriteY: 3
          },
          bottom:{
              spriteX: 14,
              spriteY: 3
          },
          front:{
              spriteX: 12,
              spriteY: 2
          },
          back:{
              spriteX: 13,
              spriteY: 2
          }
        }
      }

    case 62: //Furnace (Smelting)
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 13,
              spriteY: 2
          },
          right:{
              spriteX: 13,
              spriteY: 2
          },
          top:{
              spriteX: 14,
              spriteY: 3
          },
          bottom:{
              spriteX: 14,
              spriteY: 3
          },
          front:{
              spriteX: 13,
              spriteY: 3
          },
          back:{
              spriteX: 13,
              spriteY: 2
          }
        }
      }

    case 81: //Cactus
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 6,
              spriteY: 4
          },
          right:{
              spriteX: 6,
              spriteY: 4
          },
          top:{
              spriteX: 5,
              spriteY: 4
          },
          bottom:{
              spriteX: 5,
              spriteY: 4
          },
          front:{
              spriteX: 6,
              spriteY: 4
          },
          back:{
              spriteX: 6,
              spriteY: 4
          }
        }
      }

    case 84: //Jukebox
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 10,
              spriteY: 4
          },
          right:{
              spriteX: 10,
              spriteY: 4
          },
          top:{
              spriteX: 11,
              spriteY: 4
          },
          bottom:{
              spriteX: 10,
              spriteY: 4
          },
          front:{
              spriteX: 10,
              spriteY: 4
          },
          back:{
              spriteX: 10,
              spriteY: 4
          }
        }
      }

    case 86: //Pumpkin
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 6,
              spriteY: 7
          },
              right:{
              spriteX: 6,
              spriteY: 7
          },
              top:{
              spriteX: 6,
              spriteY: 6
          },
              bottom:{
              spriteX: 6,
              spriteY: 7
          },
              front:{
              spriteX: 7,
              spriteY: 7
          },
              back:{
              spriteX: 6,
              spriteY: 7
          }
        }
      }

    case 91: //Jack-o-Lantern
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 6,
              spriteY: 7
          },
          right:{
              spriteX: 6,
              spriteY: 7
          },
          top:{
              spriteX: 6,
              spriteY: 6
          },
          bottom:{
              spriteX: 6,
              spriteY: 7
          },
          front:{
              spriteX: 8,
              spriteY: 7
          },
          back:{
              spriteX: 6,
              spriteY: 7
          }
        }
      }

    case 92: //Cake (Block)
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 10,
              spriteY: 7
          },
          right:{
              spriteX: 10,
              spriteY: 7
          },
          top:{
              spriteX: 9,
              spriteY: 7
          },
          bottom:{
              spriteX: 11,
              spriteY: 7
          },
          front:{
              spriteX: 10,
              spriteY: 7
          },
          back:{
              spriteX: 10,
              spriteY: 7
          }
        }
      }

    case 103: //Melon (Block)
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: 8,
              spriteY: 8
          },
          right:{
              spriteX: 8,
              spriteY: 8
          },
          top:{
              spriteX: 9,
              spriteY: 8
          },
          bottom:{
              spriteX: 8,
              spriteY: 8
          },
          front:{
              spriteX: 8,
              spriteY: 8
          },
          back:{
              spriteX: 8,
              spriteY: 8
          }
        }
      }

    default: //wildcard
      paramaters = {
        image: 'mc-sprite.png',
        imageSize: 256,
        spriteSize: 16,
        sides:{
          left:{
              spriteX: spritePosition(blockId)[0]/16,
              spriteY: spritePosition(blockId)[1]/16
          },
          right:{
              spriteX: spritePosition(blockId)[0]/16,
              spriteY: spritePosition(blockId)[1]/16
          },
          top:{
              spriteX: spritePosition(blockId)[0]/16,
              spriteY: spritePosition(blockId)[1]/16
          },
          bottom:{
              spriteX: spritePosition(blockId)[0]/16,
              spriteY: spritePosition(blockId)[1]/16
          },
          front:{
              spriteX: spritePosition(blockId)[0]/16,
              spriteY: spritePosition(blockId)[1]/16
          },
          back:{
              spriteX: spritePosition(blockId)[0]/16,
              spriteY: spritePosition(blockId)[1]/16
          }
        }
      }
  }
  return paramaters;
}