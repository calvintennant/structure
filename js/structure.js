blocks = new Array();
var currentZ = new Number;
var currentX = new Number;
var currentY = new Number;
var rotation = 0;
var enable3d = false;
var ready = false;

window.onload=function(){
  blocks = loadBlocks();

  if (Drupal.settings.structureMode == 'edit') {
    structureBuild();
  }
  
  (function ($) {
    $(document).ready(function(){
      $('a.enable-3d').click(function() {
        initiate3d();
        enable3d = true;
        return false;
      });
            
    });
  })(jQuery); 
  
  var startTime = new Date();
  var endTime = new Date();
}
 /* Provide blocks as array from document as string. This function will
  * be used to deserialize blocks data from the database
  * 
  * @return blocks as array
  */
  function loadBlocks() {
    startTime = new Date().getTime();
    var blocks = new Array();

    // load blocks from page element
    var blockstr = Drupal.settings.structureArray;

    // if element provided data..
    if (blockstr) {
     /* Split up blockstr and loop through creating our
      * multi-dimensional blocks array
      */
      blockstr = blockstr.split(",");
      for (var i = 0, block; block = blockstr[i]; i++) {
        block = block.replace(/[[]/g, '');
        block = block.split(']');
        blocks[i] = block;
      }
    }
    endTime = new Date().getTime();
    console.log('Execution time of loadBlocks(): ' + (Number(endTime) - Number(startTime)));

    return blocks;
  }
  
  function textureDefinition(blockid) {
    switch (blockid) {
      case '0':
      case '1':
        x = '1'
        y = '0'
      case '2':
        x = '0'
        y = '0'
      case '3':
      case '4':
        x = '0'
        y = '1'
      case '5':
      case '6':
        x = '-1'
        y = '1'
      case '6:1':
        x = '-1'
        y = '4'
      case '6:2':
        x = '-1'
        y = '5'
      case '7':
        x = '1'
        y = '1'
      case '8':
      case '9':
        x = '14'
        y = '13'
      case '10':
      case '11':
        x = '13'
        y = '14'
      case '12':
        x = '2'
        y = '1'
      case '13':
        x = '3'
        y = '1'
      case '14':
        x = '0'
        y = '2'
      case '15':
        x = '1'
        y = '2'
      case '16':
        x = '2'
        y = '2'
      case '17':
        x = '5'
        y = '1'
      case '17:1':
        x = '4'
        y = '7'
      case '17:2':
        x = '5'
        y = '7'
      case '18':
      case '18:1':
      case '18:2':
      case '19':
        x = '0'
        y = '3'
      case '20':
        x = '1'
        y = '3'
      case '21':
        x = '0'
        y = '10'
      case '22':
        x = '0'
        y = '9'
      case '23':
        x = '14'
        y = '2'
      case '24':
        x = '0'
        y = '12'
      case '25':
      case '26':
      case '27':
        x = '3'
        y = '10'
      case '28':
        x = '3'
        y = '12'
      case '29':
        x = '10'
        y = '6'
      case '30':
      case '31':
      case '31:1':
      case '31:2':
      case '32':
        x = '7'
        y = '3'
      case '33':
        x = '11'
        y = '6'
      case '34':
      case '35':
        x = '0'
        y = '4'
      case '35:1':
        x = '2'
        y = '13'
      case '35:2':
        x = '2'
        y = '12'
      case '35:3':
        x = '2'
        y = '11'
      case '35:4':
        x = '2'
        y = '10'
      case '35:5':
        x = '2'
        y = '9'
      case '35:6':
        x = '1'
        y = '8'
      case '35:7':
        x = '1'
        y = '7'
      case '35:8':
        x = '1'
        y = '14'
      case '35:9':
        x = '1'
        y = '13'
      case '35:10':
        x = '1'
        y = '12'
      case '35:11':
        x = '1'
        y = '11'
      case '35:12':
        x = '1'
        y = '10'
      case '35:13':
        x = '1'
        y = '9'
      case '35:14':
        x = '0'
        y = '8'
      case '35:15':
        x = '0'
        y = '7'
      case '36':
      case '37':
        x = '13'
        y = '0'
      case '38':
        x = '12'
        y = '0'
      case '39':
        x = '13'
        y = '1'
      case '40':
        x = '12'
        y = '1'
      case '41':
        x = '7'
        y = '1'
      case '42':
        x = '6'
        y = '1'
      case '43':
        x = '5'
        y = '0'
      case '43:1':
      case '43:2':
      case '43:3':
      case '43:4':
      case '43:5':
      case '44':
      case '44:1':
      case '44:2':
      case '44:3':
      case '44:4':
      case '44:5':
      case '45':
        x = '7'
        y = '0'
      case '46':
        x = '8'
        y = '0'
      case '47':
        x = '3'
        y = '2'
      case '48':
      case '49':
        x = '5'
        y = '2'
      case '50':
        x = '0'
        y = '5'
      case '51':
      case '52':
        x = '1'
        y = '4'
      case '53':
      case '54':
        x = '11'
        y = '1'
      case '55':
      case '56':
        x = '2'
        y = '3'
      case '57':
        x = '8'
        y = '1'
      case '58':
        x = '11'
        y = '2'
      case '59':
      case '60':
      case '61':
        x = '12'
        y = '2'
      case '62':
      case '63':
      case '64':
        x = '1'
        y = '6'
      case '65':
        x = '3'
        y = '5'
      case '66':
        x = '-1'
        y = '8'
      case '67':
      case '68':
      case '69':
      case '70':
        x = '6'
        y = '0'
      case '71':
        x = '2'
        y = '6'
      case '72':
      case '73':
        x = '3'
        y = '3'
      case '74':
      case '75':
      case '76':
        x = '3'
        y = '6'
      case '77':
      case '78':
        x = '2'
        y = '4'
      case '79':
        x = '3'
        y = '4'
      case '80':
      case '81':
        x = '6'
        y = '4'
      case '82':
        x = '8'
        y = '4'
      case '83':
        x = '9'
        y = '4'
      case '84':
        x = '11'
        y = '4'
      case '85':
      case '86':
        x = '6'
        y = '6'
      case '87':
        x = '7'
        y = '6'
      case '88':
        x = '8'
        y = '6'
      case '89':
        x = '9'
        y = '6'
      case '90':
      case '91':
        x = '7'
        y = '7'
      case '92':
        x = '9'
        y = '7'
      case '93':
      case '94':
        x = '2'
        y = '8'
      case '95':
      case '96':
        x = '4'
        y = '5'
      case '97':
      case '98':
        x = '6'
        y = '3'
      case '98:1':
        x = '4'
        y = '6'
      case '98:2':
      case '99':
        x = '13'
        y = '7'
      case '100':
        x = '12'
        y = '7'
      case '101':
        x = '5'
        y = '5'
      case '102':
      case '103':
        x = '8'
        y = '8'
      case '104':
      case '105':
      case '106':
      case '107':
      case '108':
      case '109':
      case '110':
      case '111':
      case '112':
      case '113':
      case '114':
      case '115':
      case '116':
      case '117':
      case '118':
      case '119':
      case '120':
      case '121':
        x = '0'
        y = '13'
      case '122':
    }
  }

function structureBuild() {
  (function ($) {
    $(document).ready(function(){
      drawControls(currentZ, currentX, currentY, blocks);
      
      $('.up-z').click(function() {
        console.log('up');
        currentZ++;
        drawControls(currentZ, currentX, currentY, blocks); 
        if (enable3d) {
          grid = drawGrid(scene, currentZ, grid);
        }
        return false;
      });

      $('.down-z').click(function() {
        console.log('down');
        currentZ--;
        drawControls(currentZ, currentX, currentY, blocks);  
        if (enable3d) {
          grid = drawGrid(scene, currentZ, grid);
        } 
        return false;
      });

      $('.north-y').click(function() {
        console.log('north');
        currentY--;
        drawControls(currentZ, currentX, currentY, blocks);  
        return false;
      });

      $('.south-y').click(function() {
        console.log('south');
        currentY++;
        drawControls(currentZ, currentX, currentY, blocks);  
        return false;
      });

      $('.east-x').click(function() {
        console.log('east');
        currentX++;
        drawControls(currentZ, currentX, currentY, blocks);  
        return false;
      });

      $('.west-x').click(function() {
        console.log('west');
        currentX--;
        drawControls(currentZ, currentX, currentY, blocks);  
        return false;
      });
      
      
      $('#edit-block-type input').next().append('<span class="block-rotation"><a href="#rotate" class="block-rotate rotation-' + rotation + '">Rotation ' + rotationSymbol(rotation) + '</a></span>');
      $('#edit-block-type input').parent().find('.block-rotation').hide();
      $('#edit-block-type input:checked').parent().find('.block-rotation').show();
      
      $('#edit-block-type').change(function(){
        $('#edit-block-type input').parent().find('.block-rotation').hide();
        $('#edit-block-type input:checked').parent().find('.block-rotation').show();
      });
      
      $('a.block-rotate').click(function(){
        if (rotation < 3) { rotation++ }
        else { rotation = 0; }
        $('#edit-block-type .block-rotate').attr('class', 'block-rotate rotation-' + rotation);
        $('#edit-block-type .block-rotate').text('Rotation ' + rotationSymbol(rotation));
        return false;
      });

      $('#edit-submit').click(function() {
        var blockstr = new String;
        $('#edit-field-structurearray-und-0-value').val('');
        for (var i = 0, block; block = blocks[i]; i++) {
          for (var j = 0; block[j]; j++) {
            block[j] = '[' + block[j] + ']';
          }
        blockstr += block.slice(0,5).toString().replace(/,/g, '') + ',';
        }
        $('#edit-field-structurearray-und-0-value').val(blockstr);
      });

      $('#structure-node-form .xy-grid').selectable({
        
        selecting: function(event, ui){ 
          $(".ui-selecting:not(.ui-unselecting)", this).each(function(){
              if($(this).attr('style')){
                $(this).attr('oldstyle', $(this).attr('style'));
              }
              $(this).css('background-image', 'url(' + '\'/' + Drupal.settings.structurePath + '/sprites/mc-sprite_' + $('input:radio[name=block_type]:checked').val() + '.png\')');
              $(this).css('opacity', '1');
              $(this).addClass('ui-unselecting')
          });
        },
        
        unselecting: function(event, ui){
          $(".ui-unselecting:not(.ui-selecting)", this).each(function(){
            if ($(this).attr('oldstyle')) {
              $(this).attr('style', $(this).attr('oldstyle'));
            }
            else {
              $(this).removeAttr('style');
            }
            $(this).removeAttr('oldstyle');
            $(this).removeClass('ui-unselecting');
          });
        },

        stop: function(event, ui){
          $(".ui-selected", this).each(function(){
            $(this).removeAttr('oldstyle');
            $(this).removeClass('ui-unselecting');
            block = identifyBlock(this);
            type = $('input:radio[name=block_type]:checked').val();
            $(this).attr('class', 'mc-block '+ type);
            blocks = addBlock(blocks,block);
          });
          drawControls(currentZ, currentX, currentY, blocks);
        }
      });
      
      /* Small helper function to determine which arrow symobl to print
       * 
       * @param rotation
       * 
       * @return string as either ↑, →, ↓ or ←
       */
      function rotationSymbol(rotation) {
             if (rotation == '0') { symbol = '\u2191'; }
        else if (rotation == '1') { symbol = '\u2192'; }
        else if (rotation == '2') { symbol = '\u2193'; }
        else { symbol = '\u2190'; }
        return symbol;
      }
      

     /* Add array block to array blocks
      * 
      * @param blocks as array
      * @param block as array
      * @return blocks as array
      */
      function addBlock(blocks,block) {
        startTime = new Date().getTime();

        for(var i=0; blocks[i]; i++) {
         /* 
          * First run through all items in blocks array and 
          * make sure that block is unique
          */
          if (block[0] == blocks[i][0]
            && block[1] == blocks[i][1]
            && block[2] == blocks[i][2]
            && block[3] == blocks[i][3]
            && block[3] == blocks[i][4]) {
            //console.log('nothing to add');
            return blocks;
          }
         /* 
          * if block is unique make sure that there aren't any other blocks
          * with the same coordinates, if there are remove them
          */
          else if (block[0] == blocks[i][0]
                && block[1] == blocks[i][1]
                && block[2] == blocks[i][2]) {
            //console.log('killing block..');
            if (enable3d) {
              killBlock(blocks[i][5]);
            }
            blocks.splice(i,1);
            break;
          }
        }

       /*
        * ensure that the block we're about to add isn't a 0 block (air)
        */
        if (block[3] !=  0) {
          //console.log('adding block..');
          blocks.push(block);
          
          if (enable3d) {
            block = drawBlock(block);
          }
        }
        endTime = new Date().getTime();
        console.log('Execution time of addBlock(): ' + (Number(endTime) - Number(startTime)));
        return blocks;
      }

     /* Draw user interface controls on the screen
      * 
      * @param current Z position as number
      * @param current X position as number
      * @param current Y position as number
      * @param blocks as array
      */
      function drawControls(Z, X, Y, blocks) {
        startTime = new Date().getTime();
        //console.log('drawing controls');
       /* If there aren't any .xy-grid .mc-block elements then it's our first
        * time through, create them
        */
        if ($('#structure-node-form .xy-grid .mc-block').length == 0) {
          zcount = Z;xcount = X;ycount = Y;
          for (var i=0;i<=255;i++) {
            $('#structure-node-form .xy-grid').append('<div class="mc-block air" id="Z'+ zcount + '_X'+ xcount + '_Y' + ycount + '">');
            if (xcount < X+15) { xcount++; }
            else if (ycount < Y+15) { xcount = X;ycount ++; }
            else { xcount = X;ycount = Y;zcount --; }
          }
        }

       // Identify each .xy-grid .mc-block element and remove style attribute
        zcount = Z;xcount = X;ycount = Y;
        $('#structure-node-form .xy-grid .mc-block').each(function() {
          $(this).attr('id', 'Z'+ zcount + '_X'+ xcount + '_Y' + ycount);

          if (xcount < X+15) { xcount++; }
          else if (ycount < Y+15) { xcount = X; ycount ++; }
          else { xcount = X; ycount = Y; zcount --; }

          $(this).removeAttr('style');
        });

       // loop through blocks and style .xy-grid .mc-blocks
        for (var i = 0; blocks[i]; i++) {
           // If there is a matching .xy-grid .mc-blocks element style it
            if($('#Z'+ blocks[i][0] + '_X'+ blocks[i][1] + '_Y' + blocks[i][2]).length == 1){
              $('#Z'+ blocks[i][0] + '_X'+ blocks[i][1] + '_Y' + blocks[i][2]).attr('style', '\n\
              background-image: url(\'/' + Drupal.settings.structurePath + '/sprites/mc-sprite_' + blocks[i][3] + '.png\');\n\
              transform:rotate(' + blocks[i][4]*90 + 'deg);\n\
              -ms-transform:rotate(' + blocks[i][4]*90 + 'deg);\n\
              -moz-transform:rotate(' + blocks[i][4]*90 + 'deg);\n\
              -webkit-transform:rotate(' + blocks[i][4]*90 + 'deg);\n\
              -o-transform:rotate(' + blocks[i][4]*90 + 'deg);\n\
              opacity: 1;');
            }
           /* if there is not a matching .xy-grid .mc-blocks element, see if
            * there is a matching element on a lower Z-level and draw it in 
            * with a slightly lesser opacity
            */
            else {
            for(var j = 0; j<4; j++) {
                if  ($('#Z'+ (Number(blocks[i][0])+j) + '_X'+ blocks[i][1] + '_Y' + blocks[i][2]).length == 1 &&
                  (!($('#Z'+ (Number(blocks[i][0])+j) + '_X'+ blocks[i][1] + '_Y' + blocks[i][2]).attr('style')) ||
                    ($('#Z'+ (Number(blocks[i][0])+j) + '_X'+ blocks[i][1] + '_Y' + blocks[i][2]).css('opacity')<(.5 - (j/10))))) {
                    $('#Z'+ (Number(blocks[i][0])+j) + '_X'+ blocks[i][1] + '_Y' + blocks[i][2]).attr('style', '\n\
                  background-image: url(\'/' + Drupal.settings.structurePath + '/sprites/mc-sprite_' + blocks[i][3] + '.png\');\n\
                  transform:rotate(' + blocks[i][4]*90 + 'deg);\n\
                  -ms-transform:rotate(' + blocks[i][4]*90 + 'deg);\n\
                  -moz-transform:rotate(' + blocks[i][4]*90 + 'deg);\n\
                  -webkit-transform:rotate(' + blocks[i][4]*90 + 'deg);\n\
                  -o-transform:rotate(' + blocks[i][4]*90 + 'deg);\n\
                  opacity: ' + (.5 - (j/10)) + ' ;');
                break;
              }
            }
          }
        }
        endTime = new Date().getTime();
        console.log('Execution time of drawControls(): ' + (Number(endTime) - Number(startTime)));
      }

     /* Provide .xy-grid .mc-block element and return it as block array
      * 
      * @param thisblock as HTML element
      * @return new Array as structured block (X,Y,Z,TYPE)
      */
      function identifyBlock(thisblock) {
        startTime = new Date().getTime();
        //isolate the coordinates
        id = $(thisblock).attr("id");
        coords = id.replace(/[^0-9-_.]/g, "");
        coords = coords.split("_");
        return new Array (coords[0],coords[1],coords[2],$('input:radio[name=block_type]:checked').val(),rotation);
        endTime = new Date().getTime();
        console.log('Execution time of identifyBlock(): ' + (Number(endTime) - Number(startTime)));
      }

    });
  })(jQuery); 
}