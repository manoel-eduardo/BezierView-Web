function Reader(){
}

/** The parser object **/
Reader.prototype.bvFileParser = function(str){
    this.lines = str.split('\n');
    this.stream = [];
    for(var i = 0; i < this.lines.length; i++){
        var line = trim(this.lines[i]);
        if(line.length == 0)
            continue;
        var segs = trim(line).split(/\s+/);
        
        // append all the segments
        this.stream = this.stream.concat(segs);
    }
    this.currentPos = 0;
};

/** Methods for the parser object **/
Reader.prototype.bvFileParser.prototype = {
    hasNext : function(){
        return this.currentPos < this.stream.length;
    },

    nextToken : function(){
        var last = this.currentPos;
        this.currentPos = this.currentPos + 1;
        return this.stream[last];
    },

    nextInt : function(){
        return parseInt(this.nextToken());
    },

    nextFloat : function(){
        return parseFloat(this.nextToken());
    },
};

Reader.prototype.getPatches = function(str){
    var parser = new this.bvFileParser(str);
    var patches = [];
    
    while(parser.hasNext()){
        //Get type
        var patchType;
        patchType = parser.nextInt();
        
        //Load mesh according to the patch type
        switch(patchType){
            case 1:
                patches.push(this.loadPolyhedronMesh(parser));
                break;
                
            case 3: // triangular bezier
                patches.push(this.loadTriangularMesh(parser));
                break;
                
            case 4: // tensor-product
            case 5:
            case 8:
                patches.push(this.loadTensorProductMesh(patchType,parser));
                break;
                
            default:
                alert("Error at load the mesh. unsupport format "+patchType);
        }
    }
    
    return patches;
};

/* Load Polyhedron patch - Type 1 */
Reader.prototype.loadPolyhedronMesh = function(parser){
    //Retrieve # vertices and # faces
    var numVertices, numFaces;
    numVertices = parser.nextInt();
    numFaces = parser.nextInt();
    
    //Create geometry
    var geo = new THREE.Geometry();
    
    //Load vertices
    for(var i = 0; i < numVertices; i++){
        var x = parser.nextFloat();
        var y = parser.nextFloat();
        var z = parser.nextFloat();
        geo.vertices.push(new THREE.Vector4(x,y,z,1.0));
    }
    
    //Load faces
    for(var i = 0; i < numFaces; i++){
        var numVertFace = parser.nextInt();
        if(numVertFace == 3){
            geo.faces.push(new THREE.Face3(parser.nextInt(), parser.nextInt(), parser.nextInt()));
        }else if(numVertFace == 4){
            //Transforming one Face4 in two Face3
            var a = parser.nextInt();
            var b = parser.nextInt();
            var c = parser.nextInt();
            var d = parser.nextInt();
            
            geo.faces.push(new THREE.Face3(a, b, c));
            geo.faces.push(new THREE.Face3(a, c, d));
        }else{
            alert("Error at create the object faces");
            return null;
        }
    }
    
    //Compute normals
    geo.computeFaceNormals();
    geo.computeVertexNormals();
    
    //Return geometry object
    return geo;
};

/** Handles triangular bezier patches
	Type 3
 **/
Reader.prototype.loadTriangularMesh = function(parser){
    var deg = parser.nextInt();
    var vertices = [];
    
    // read all the control points
    for(var i = 0; i < ((deg+2) * (deg+1)/2); i++) {
        var x = parser.nextFloat();
        var y = parser.nextFloat();
        var z = parser.nextFloat();
        vertices.push(new THREE.Vector4(x,y,z,1.0));
    }

    //Define faces
    eVal = new EVal();
    geo = eVal.eval_control_mesh(3, deg, vertices);
    
    //Compute normals
    geo.computeFaceNormals();
    geo.computeVertexNormals();
    
    return geo;
};

/** Handles tensor-product patches
    Types 4, 5 and 8 for now  **/
Reader.prototype.loadTensorProductMesh = function(type, parser){
    // The degree in the u and v directionm
	var degu,degv;

	if(type == 4){ // same degree in both directions
		degu = parser.nextInt();
		degv = degu;
	}
	else{// type (5) and (8) - general patch and rational tensor-product
		degu = parser.nextInt();
		degv = parser.nextInt();
	}

	// read all the control points
	var vertices = [];
	for(var i = 0; i < (degu+1)*(degv+1); i++){
		if(type == 8){ // rational tensor-product: also has weight value 
            var x = parser.nextFloat();
            var y = parser.nextFloat();
            var z = parser.nextFloat();
            var w = parser.nextFloat();
            
			vertices.push(new THREE.Vector4(x,y,z,w));
		}else{
            var x = parser.nextFloat();
            var y = parser.nextFloat();
            var z = parser.nextFloat();
            
			vertices.push(new THREE.Vector4(x,y,z,1.0));
		}
	}
	
	//Define faces
	eVal = new EVal();
	geo = eVal.eval_control_mesh(type, [degu,degv], vertices);
	
	//Compute normals
    geo.computeFaceNormals();
    geo.computeVertexNormals();
    
    return geo;
};

/** Utility functions to trim a string**/
function trim(str){
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};