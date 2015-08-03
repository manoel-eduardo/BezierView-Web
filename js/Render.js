function Render(){
    /* Variables for the scene */
    var camera, scene, renderer, geometry, material, regular_material, curvature_material, controls, pointLight;
    
    /* the meshes */
    var patch_mesh, curvature_mesh, current_mesh;
    var patch_meshes, control_meshes;
    
    /* The 3DObjects*/
    var patch_object, control_object, root_object;
    
    /* User-dependent variables */
    var show_curvature, show_controlMesh, show_patch;
    
    var subdivision_level = 5;
    
    /*Reader object*/
    var reader;
    
    bvstr = "";
    
    /** Mesh files **/
    var polyhedron = "data/cube.bv";
    var bicubic     = "data/tp3x3.bv";
    var rational    = "data/dtorus.bv";
    var triangular  = "data/tri1.bv";
    
    /** render mode **/
    //var render_mode = bvPatch.normal;
}
    
/** The initialization function **/
Render.prototype.init = function() {
    //Reader object
    this.reader = new Reader();
    
    //Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.01, 1000 );
	this.camera.position.z = 5;
    this.scene.add( this.camera );
	
	//Create render
	this.renderer = new THREE.WebGLRenderer();
    this.renderer.setClearColor( 0xffffff, 1 );
    this.renderer.setSize( window.innerWidth, window.innerHeight );
    
    //Orbit Control
    this.controls = new THREE.OrbitControls( this.camera, $("#viewer").get(0));
    this.controls.addEventListener( 'change', this.render.bind(this) );

    // Lights
    pointLight1 = new THREE.PointLight( 0xffffff );
    pointLight1.position.x = 360;
	pointLight1.position.z = 360;
    this.scene.add( pointLight1 );

    pointLight2 = new THREE.PointLight( 0xffffff );
    pointLight2.position.x = -360;
	pointLight2.position.z = 0;
    this.scene.add( pointLight2 );

    //Initializate variables accordint to the menu
    this.show_patch         = $("#polygonFace").is(":checked");
    this.show_controlMesh   = $("#polygonMesh").is(":checked");
    
    //this.show_curvature     = false;
    /*this.renderer.sortObjects = false;
    this.renderer.setFaceCulling(false);*/

    return this.renderer.domElement;
};

Render.prototype.rotate = function() {
    var SPEED = 0.005;
    this.root_object.rotation.x -= SPEED * 2;
    this.root_object.rotation.y -= SPEED;
    this.root_object.rotation.z -= SPEED * 3;
};

/** the loop function **/
Render.prototype.render = function() {
    requestAnimationFrame( this.render.bind(this) );
    //this.rotate();
    this.renderer.render( this.scene, this.camera );
};

/** Function to set a new mesh **/
Render.prototype.setMeshFromFile = function(file) {
    // first remove all the current ones
    this.removeAllMeshes();

    // load new mesh
    this.loadMeshFromFile(file, this);
};

Render.prototype.setMeshFromText = function(data) {
    // first remove all the current ones
    this.removeAllMeshes();

    // load new mesh
    this.loadMesh(data);
};

/** Removes all the meshes from the scene **/
Render.prototype.removeAllMeshes = function() {
    this.scene.remove(this.root_object);
};

/** Loads the patches from a file **/
Render.prototype.loadMeshFromFile = function(file, render) {
    $.get(file, function(data) {
        render.loadMesh(data);
    })
    .error(function() {
        alert('Error reading ' + file);
    });
};

/** Load Mesh from string data **/
Render.prototype.loadMesh = function(data) {
    //Initialize vector to store the meshes
    this.patch_meshes = [];

    //Creating a new 3DObjects
    this.root_object = new THREE.Object3D();
    this.patch_object = new THREE.Object3D();
	this.control_object = new THREE.Object3D();
	
	//Setting names
	this.root_object.name = "root_object";
	this.patch_object.name = "patch_object";
	this.control_object.name = "control_object";
	
    //Getting geometries from the file
    var patches = this.reader.getPatches(data);

    //Creating a defatul material to fill the mesh
    var material = new THREE.MeshPhongMaterial();
    //var material = new THREE.MeshBasicMaterial( { color: 0xB4000, wireframe: false } );
    var wireframeMaterial = new THREE.MeshLambertMaterial({ wireframeLinewidth: 5, color: 0x000000, wireframe: true });
    
    
    //Evaluator object
    evaluator = new EVal();
    
    //Adding all meshes loaded from the file to the Object3D
    for(var i = 0; i < patches.length; i++){
        //Creating patch object
        var patch_mesh = new bvPatch(patches[i], {subdivisionLevel: this.subdivision_level});
        
        //Create control geometry
        var control_geometry;
		if (patches[i].type == 1) // polyhedron
			control_geometry = patches[i].geometry;
		else if (patches[i].type == 3) // triangular bezier
			control_geometry = evaluator.eval_control_mesh(patches[i].type, patches[i].deg, patches[i].pts);
		else
			control_geometry = evaluator.eval_control_mesh(patches[i].type, [patches[i].degu,patches[i].degv], patches[i].pts);

        //Add the current meshes to the 3DObject to render in scene
        //this.patch_object.add(new THREE.Mesh( patch_mesh.geometry,  mat));
        this.patch_object.add(patch_mesh);
        this.control_object.add(new THREE.Mesh( control_geometry,  wireframeMaterial));
        
        //Store the meshes in the array to future manipulation
        this.patch_meshes.push(patch_mesh);
    }
    
    this.setDoubleSided();

    // proper viewing of patches and control mesh
	this.toggle_patches();
	this.toggle_controlMeshes();
	
	//Adding the 3DObjects to the root_object
    this.root_object.add(this.patch_object);
    this.root_object.add(this.control_object);
    
    //Adding the root_object (Object3D) to the scene
    this.scene.add(this.root_object);
};

Render.prototype.setDoubleSided = function(){
    this.patch_object.traverse( function( node ) {
        if( node.material ) {
            node.material.side = THREE.DoubleSide;
        }
    });
};

/** Toggle viewing patches **/
Render.prototype.toggle_patches = function(toggle) {
	toggle !== 'undefined' ? toggle : false;
	if (toggle)
		this.show_patch = !this.show_patch;
	
	//Change the visibility of the patch_object
	this.patch_object.visible = this.show_patch;
};

/** Toggle viewing control meshes **/
Render.prototype.toggle_controlMeshes = function(toggle) {
	toggle !== 'undefined' ? toggle : false;
	if (toggle)
		this.show_controlMesh = !this.show_controlMesh;
	
	//Change the visibility of the control_object	
	this.control_object.visible = this.show_controlMesh;
};

Render.prototype.setRenderMode = function(mode) {
	// update for each mesh
	this.render_mode = mode;
	for (var i = 0; i < this.patch_meshes.length; i++)
		this.patch_meshes[i].setRenderMode(mode);
};

// set the curvature scale range
Render.prototype.setPatchCurvatureRange = function(minc,maxc){
	for(var i = 0; i < this.patch_meshes.length; i++){
		this.patch_meshes[i].setCurvatureRange(minc,maxc);
	}    
};

Render.prototype.setRendererSize = function() {
	if (this.renderer) {
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		
		// update the projection matrix of the camera too
		this.camera.aspect = window.innerWidth/window.innerHeight;
		this.camera.updateProjectionMatrix();
	}
};

// set new coordinates values (x, y, z) to the camera
Render.prototype.setCameraPosition = function(x, y, z){
  this.camera.position.x = x;
  this.camera.position.y = y;
  this.camera.position.z = z;
};

// return the actual coordinates (x, y, z) of the camera position
Render.prototype.getCameraPosition = function(){
    return {x: this.camera.position.x, y:this.camera.position.y, z:this.camera.position.z};
};