//Creating class
function BezierView (){
}

/* Function to check if the browser support WebGL */
BezierView.prototype.checkWebGL = function(){
    var contextNames = ["webgl","experimental-webgl","moz-webgl","webkit-3d"];
	var canvas = document.createElement('canvas');
	for(var i = 0; i < contextNames.length; i++){
		try{
			gl = canvas.getContext(contextNames[i]);
			if(gl){
				break;
			}
		}catch(e){
			continue;//noWebGL("Unfortunately, there's a WebGL compatibility problem. </br> You may want to check your system settings.");
			//return;
		}
	}
    if(gl === undefined) {
        alert("WebGL has not been detected on your system.  Please check your settings.");
        return false;
    }
    
    return true;
};

/* Function responsable to call all functions to initialize the screen*/
BezierView.prototype.init = function(render){
    //Hide the input textarea
    $("#bvTextInput").css("display", "none");
    
    //Active Default Meshes Menu
    this.activeDefaultMeshesMenu();
    
    //Active BV Input Text Menu
    this.activeBVInputTextMenu(render);
    
    //Active Display Menu
    this.activeDisplatMenu(render);
};

BezierView.prototype.activeDefaultMeshesMenu = function(){
    $(".deafult-mesh").each(function(){
            $(this).on('click', function(){
                    //Load the file path
                    var filepath = $(this).attr("filepath");
                    
                    //Set mesh
                    render.setMeshFromFile(filepath);
                    
                    //The the canvas as visible
                    $("#bvTextInput").css("display", "none");
                    $("#viewer").css("display", "block");
            });
    });  
};

BezierView.prototype.activeBVInputTextMenu = function(render){
    //Script to open the textarea
    $("#bvTextInputMenu").on('click', function(){
        //Hide the canvas
        $("#viewer").css("display", "none");
        
        //Display the input
        $("#bvTextInput").css("display", "block");
        
        //Set the focus on the input textarea
        $("#bvInput").focus();
    });
    
    //Script to load the textarea information
    $("#loadBVTextInput").on('click', function(){
        //Retrieve the data
        var data = $("#bvInput").val();
       
        //Hide the input
        $("#bvTextInput").css("display", "none");
        
        //Display the canvas
        $("#viewer").css("display", "block");
        
        //Clean the textarea
        $("#bvInput").val("");
        
        //Load Mesh
        render.setMeshFromText(data);
    });
    
    //Script to close the textarea
    $("#closeBVTextInput").on('click', function(){
        //Hide the input
        $("#bvTextInput").css("display", "none");
        
        //Display the canvas
        $("#viewer").css("display", "block");
        
        //Clean text
        $("#bvInput").val("");
    });
};

BezierView.prototype.activeDisplatMenu = function(render){
    $("#polygonFace").on('change', function(){
        render.toggle_patches(true);
    });
    
    $("#polygonMesh").on('change', function(){
        render.toggle_controlMeshes(true);
    });
};