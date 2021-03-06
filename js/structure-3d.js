var structure = new Object();

/**
 * Function that initates 3d/three.js
 */
function initiate3d() {

  var renderer = new THREE.WebGLRenderer();
  var stats = new Stats();
  stats.historical = new Array();

  (function ($) {
    // container
    container = $('#mc-3d .canvas-wrapper');
    container.empty();

    // renderer
    renderer.setSize(container.innerWidth(), container.innerHeight());

    $('#mc-3d .canvas-wrapper').append( renderer.domElement );

    $('#mc-3d .zoom-in').click(function(){structure.zoom  --});
    $('#mc-3d .zoom-out').click(function(){structure.zoom ++});

    $('#mc-3d').append( stats.getDomElement() );
  })(jQuery); 

  // scene
  var scene = new THREE.Scene();

  // camera
  var camera = new THREE.PerspectiveCamera(45, container.innerWidth() / container.innerHeight(), 1, 10000);

  // add subtle ambient lighting
  var ambientLight = new THREE.AmbientLight(0x555555);

  // add directional light source
  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 1, 1).normalize();

  // create wrapper object that contains three.js objects
  structure = {
      renderer: renderer,
      camera: camera,
      light1: ambientLight,
      light2: directionalLight,
      scene: scene,
      meshCache: new Object(),
      zoom: Number(10),
      math: new Object(),
      stats: stats,
  };

  /**
   * Function returns distance between two points in three dimensional space
   *
   * @param a as Array(x, y, z)
   * @param b as Array(x, y, z)
   * @return Number
   */
  structure.math.getDistance = function(a, b) {
    return Math.sqrt(
      Math.pow((b[0] - a[0]), 2) +
      Math.pow((b[1] - a[1]), 2) +
      Math.pow((b[2] - a[2]), 2)
    );
  }

  /**
   * @param x
   * @param y
   * @param z
   * @return Three.js Materials
   * Function 
   */
  structure.getBlockMaterials = function(x, y, z) {
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
  structure.generateBlockObject = function(x, y, z) {
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
  structure.removeBlockFromScene = function(x, y, z) {
    if (schematic.getBlockId(x, y, z) != 0) {
      var Cube = this.generateBlockObject(x, y, z);
      structure.scene.remove(Cube);
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
  structure.addBlockToChunkCache = function(x, y, z) {
    blockId = schematic.getBlockId(x, y, z);

    if ( blockId != 0 ) {
      // first check if we already have a mesh for this id cached
      // if we don't, then generate one
      if ( this.meshCache[blockId] == undefined) {
        this.generateBlockObject(x, y, z);
      }
      chunkId = this.getChunkId(x, y, z);

      this.meshCache[blockId].position = this.getBlockPositionInChunk(x, y, z);

      THREE.GeometryUtils.merge( this.chunkCache[chunkId].geometry, this.meshCache[blockId] );
    }
  }

  structure.getBlockPositionInChunk = function(x, y, z) {
    var xPos = x * 16;
    var yPos = y * 16;
    var zPos = z * 16;

    xOffset = Math.floor(x/16);
    yOffset = Math.floor(y/16);
    zOffset = Math.floor(z/16);

    return { x: (x - xOffset) * 16,
             y: (y - yOffset) * 16,
             z: (z - zOffset) * 16}
  }

  structure.getChunkId = function(x, y, z){
    var chunkPosition = schematic.getBlockChunkPosition(x, y, z);
    return chunkPosition.x + '-' + chunkPosition.y + '-' + chunkPosition.z;
  }

  structure.getSizeX = function() {
    return schematic.getSizeX() * 16;
  }

  structure.getSizeY = function() {
    return schematic.getSizeY() * 16;
  }

  structure.getSizeZ = function() {
    return schematic.getSizeZ() * 16;
  }

  structure.grid = drawGrid();

  structure.getChunkX = function(chunkId) {
    return Number(chunkId.split('-')[0]);
  }

  structure.getChunkY = function(chunkId) {
    return Number(chunkId.split('-')[1]);
  }

  structure.getChunkZ = function(chunkId) {
    return Number(chunkId.split('-')[2]);
  }

  structure.newChunk = function(chunkId) {
    return this.chunkCache[chunkId] = 
      new THREE.Mesh(
        new THREE.Geometry(),
        new THREE.MeshFaceMaterial()
      );
  }

  structure.addChunkToScene = function(chunkId) {
    // get the bounds of the chunk
    var x = this.getChunkX(chunkId) * 16;
    var y = this.getChunkY(chunkId) * 16;
    var z = this.getChunkZ(chunkId) * 16;
    var xLimit = x + 16;
    var yLimit = y + 16;
    var zLimit = z + 16;

    // check if the chunk exists, if not create it
    if ( this.chunkCache[chunkId] == undefined ) {
       this.chunkCache[chunkId] = structure.newChunk(chunkId);
    }
    else {
      // remove the chunk if it already exists
      this.scene.remove( this.chunkCache[chunkId] );
      this.chunkCache[chunkId] = structure.newChunk(chunkId);
    }

    // create every block in the chunk
    for (var xRow = x; xRow < xLimit; xRow++) {
      for (var yRow = y; yRow < yLimit; yRow++) {
        for (var zRow = z; zRow < zLimit; zRow++) {
          this.addBlockToChunkCache(xRow, yRow, zRow);
        }
      }
    }

    var chunk = this.chunkCache[chunkId];
    // make sure the chunk isn't empty
    if(chunk.geometry.faces.length > 0) {
      chunk.position = {x:x, y:y, z:z};
      chunk.chunk = true;
      this.scene.add( chunk );
    }
  }

  structure.addBlockToScene = function(x, y, z) {
    this.addChunkToScene(
      this.getChunkId(x, y, z)
    );
  }

  structure.addBlocksToScene = function(blocks) {
    var chunks = new Object();
    for (block in blocks) {
      // break blocks up by chunk
      chunks[structure.getChunkId(
        blocks[block].x,
        blocks[block].y,
        blocks[block].z
      )] = new Object();
    }
    for (chunk in chunks) {
      // draws blocks on a per-chunk basis
      this.addChunkToScene(chunk);
    }
  }

  /**
   * Function recursivly looks through entire schematic and
   * draws all chunks that if finds, one at a time
   */
  structure.addSchematicToScene = function() {
    this.scene = new THREE.Scene();
    this.scene.add(this.light1);
    this.scene.add(this.light2);
    this.scene.add(this.grid);
    // Need to clear the chunk cache because it's
    // based on position
    // @TODO base chunk cache on unique ids
    structure.chunkCache = new Object()

    var xLimit = Math.ceil(schematic.getSizeX() / 16);
    var yLimit = Math.ceil(schematic.getSizeY() / 16);
    var zLimit = Math.ceil(schematic.getSizeZ() / 16);

    for (var xRow = 0; xRow < xLimit; xRow++) {
      for (var yRow = 0; yRow < yLimit; yRow++) {
        for (var zRow = 0; zRow < zLimit; zRow++) {

          this.addChunkToScene(
            this.getChunkId (
              xRow * 16,
              yRow * 16,
              zRow * 16
            )
          );
        }
      }
    }
  }

  structure.sortChunksByDistance = function() {
    var chunksByDistance = new Array();
    for (var chunk in structure.scene.children) {
      var chunkPosition = new Array(
        structure.scene.children[chunk].position.x + 8,
        structure.scene.children[chunk].position.y + 8,
        structure.scene.children[chunk].position.z + 8
      );
      var cameraPosition = new Array(
        structure.camera.position.x,
        structure.camera.position.y,
        structure.camera.position.z
      );

      var distance = Math.floor(
        structure.math.getDistance(
          chunkPosition,
          cameraPosition
        )
      );

      chunksByDistance[distance.toString()] = chunk;
    }
    return chunksByDistance;
  }

  /*
   * Render THREE.Scene
   */
  structure.render = function() {
    var timer = new Date().getTime() * .0005;
    // position of camera determined by size of schematic
    var xMax = structure.getSizeX();
    var yMax = structure.getSizeY();
    var zMax = structure.getSizeZ();
    var zoomMod = structure.zoom * .15;
    var distance = structure.math.getDistance(
      Array(0, 0, 0),
      Array(xMax, yMax, zMax)
    ) * zoomMod;

    structure.camera.position.x = (Math.sin( timer ) * distance) + xMax/2;
    structure.camera.position.y = yMax * zoomMod;
    structure.camera.position.z = (Math.cos( timer ) * distance) + zMax/2;
    structure.camera.lookAt({
      x:xMax/2,
      y:yMax/2,
      z:zMax/2
    });

    structure.stats.update();
    this.render.frameCounter++;
    var chunksToDraw = structure.render.numberOfChunksByFramerate(chunksToDraw);
    structure.render.chunksByDistance(chunksToDraw);
    structure.renderer.render( structure.scene, structure.camera );
  }

  // counts to 20
  structure.render.frameCounter = 0;

  structure.render.numberOfChunksByFramerate = function() {
    fps = structure.stats.getFps();
    structure.stats.historical.push(fps);
    statsInHistory = stats.historical.length;

    if (statsInHistory > 20) {
      structure.stats.historical.splice(0, statsInHistory - 20);
    }
    avgFps = 0;
    for (historicalFps in structure.stats.historical) {
      avgFps += structure.stats.historical[historicalFps];
    }
    avgFps /= structure.stats.historical.length;
    return avgFps * 2;
  }

  structure.render.chunksByDistance = function(chunksToDraw) {
    //only run every 20 fromes
    if (structure.render.frameCounter % 20 == 0) {
      var chunksDrawn = 0;
      orderedChunks = structure.sortChunksByDistance();
      for (var chunkDistance in orderedChunks) {
        if (chunkDistance != undefined) {
          var chunkId = orderedChunks[chunkDistance];
          if (structure.scene.children[chunkId].chunk) {
            if (chunksToDraw > chunksDrawn) {
              // check that the object is indeed a chunk
              // make it visible
              structure.scene.children[chunkId].visible = true;
            }
            else {
              // check that the object is indeed a chunk
              // make it invisible
              structure.scene.children[chunkId].visible = false;
            }
          }
          chunksDrawn++;
        }
      }
    }
  }

  // object used to store three.js mesh objects for later use
  // as opposed to regenerating them every time
  structure.addSchematicToScene();

  animate();

}

/**
 * Draw 3D x-y axis grid in three.js scene (average execution time less than 1ms on 111126)
 *
 * @return grid as THREE.Line object 
 */
function drawGrid() {
  xMax = structure.getSizeX();
  yMax = structure.getSizeY();
  zMax = structure.getSizeZ();
  if(structure.grid) {
    structure.scene.remove(structure.grid);
  }
  var grid_material = new THREE.LineBasicMaterial( {color: 0x000000, opacity: 0.2} ),
          geometry = new THREE.Geometry(),
          floor = -8 + ( 0 * 16), step = 16;

  for (var i = 0; i <= zMax/16; i ++) {
    geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( 0   - 8, floor, i * step  - 8 ) ) );
    geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( xMax - 8, floor, i * step  - 8 ) ) );
  }

  for (var i = 0; i <= xMax/16; i ++) {
    geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( i * step - 8, floor,      - 8 ) ) );
    geometry.vertices.push( new THREE.Vertex( new THREE.Vector3( i * step - 8, floor,  zMax - 8 ) ) );
  }

  var grid = new THREE.Line(geometry, grid_material, THREE.LinePieces);
  structure.grid = grid;
  return grid;
}

/*
 * Animate THREE.Scene
 */
function animate() {
  requestAnimationFrame( animate );
  structure.scene.add(drawGrid());
  structure.render();
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
