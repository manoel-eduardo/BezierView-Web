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
    //Active Default Meshes Menu
    this.activeDefaultMeshesMenu();
    
    //Active BV Input Text Menu
    this.activeBVInputTextMenu(render);
    
    //Active Display Menu
    this.activeShowMenu(render);
    
    //Active View Meny
    this.activeViewMenu(render);
};

BezierView.prototype.activeDefaultMeshesMenu = function(){
    $(".deafult-mesh").each(function(){
            $(this).on('click', function(){
                    //Load the file path
                    var filepath = $(this).attr("filepath");
                    
                    //Set mesh
                    render.setMeshFromFile(filepath);
                    
                    //The the canvas as visible
                    $("#bvTextInput").hide();
                    $("#viewer").show();

                    //Setting regular view
                    $("#viewRegular").click();
            });
    });  
};

BezierView.prototype.activeBVInputTextMenu = function(render){
    //Script to load the textarea information
    $("#loadBVTextInput").on('click', function(){
        //Retrieve the data
        var data = $("#bvInput").val();
       
        //Clean the textarea
        $("#bvInput").val("");
        
        //Load Mesh
        render.setMeshFromText(data);
    });
    
    //Script to close the textarea
    $("#closeBVTextInput").on('click', function(){
        //Clean text
        $("#bvInput").val("");
    });
};

BezierView.prototype.activeShowMenu = function(render){
    $("#polygonFace").on('click', function(){
        render.toggle_patches(true);
    });
    
    $("#polygonMesh").on('click', function(){
        render.toggle_controlMeshes(true);
    });
};

BezierView.prototype.activeViewMenu = function(render){
    $(".view-option").each(function(){
        $(this).on('click', function(){
            var view = $(this).attr("view");
            switch(view){
                case "regular":
                    render.setRenderMode(bvPatch.Normal);
                    break;
                    
                case "curvature":
                    render.setRenderMode(bvPatch.CurvatureColor);
                    break;
                    
                case "highlight":
                    render.setRenderMode(bvPatch.HighlightLine);
                    break;
                    
                case "reflection":
                    render.setRenderMode(bvPatch.ReflectionLine);
                    break;
                    
                default:
                    alert("Error to set view")
            }
        });
    });
};