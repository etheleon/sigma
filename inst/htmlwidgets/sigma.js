HTMLWidgets.widget({

  name: "sigma",

  type: "output",
  
  initialize: function(el, width, height) {
    
    // neighbors function
    sigma.classes.graph.addMethod('neighbors', function(nodeId) {
    var k,
        neighbors = {},
        index = this.allNeighborsIndex[nodeId] || {};

    for (k in index)
      neighbors[k] = this.nodesIndex[k];

    return neighbors;
    });
    
    console.log("this is the init height:"+height+" and width" + width)
    // create our sigma object and bind it to the element
    var sig = new sigma(el.id);

    // return it as part of our instance data
    return {
      sig: sig
    };
  },

  renderValue: function(el, x, instance) {

    // parse gexf data
    var parser = new DOMParser();
    var data = parser.parseFromString(x.data, "application/xml");

    // apply settings
    for (var name in x.settings){
      console.log(name);
      instance.sig.settings(name, x.settings[name]);
    }
    


    // update the sigma instance
    sigma.parsers.gexf(
      data,          // parsed gexf data
      instance.sig,  // sigma instance we created in initialize
      function(s) {
         // We first need to save the original colors of our
      // nodes and edges, like this:
      s.graph.nodes().forEach(function(n) {
        n.originalColor = n.color;
      });
      s.graph.edges().forEach(function(e) {
        e.originalColor = e.color;
      });

      // When a node is clicked, we check for each node
      // if it is a neighbor of the clicked one. If not,
      // we set its color as grey, and else, it takes its
      // original color.
      // We do the same for the edges, and we only keep
      // edges that have both extremities colored.
      s.bind('clickNode', function(e) {
        var nodeId = e.data.node.id,
            toKeep = s.graph.neighbors(nodeId);
        toKeep[nodeId] = e.data.node;

        s.graph.nodes().forEach(function(n) {
          if (toKeep[n.id])
            n.color = n.originalColor;
          else
            n.color = '#eee';
        });

        s.graph.edges().forEach(function(e) {
          if (toKeep[e.source] && toKeep[e.target])
            e.color = e.originalColor;
          else
            e.color = '#eee';
        });

        // Since the data has been modified, we need to
        // call the refresh method to make the colors
        // update effective.
        s.refresh();
      });

      // When the stage is clicked, we just color each
      // node and edge with its original color.
      s.bind('clickStage', function(e) {
        s.graph.nodes().forEach(function(n) {
          n.color = n.originalColor;
        });

        s.graph.edges().forEach(function(e) {
          e.color = e.originalColor;
        });

        // Same as in the previous event:
        s.refresh();
      });
        
        
        // need to call refresh to reflect new settings and data
        instance.sig.refresh();
      }
    );
  },

  resize: function(el, width, height, instance) {
    // forward resize on to sigma renderers
    for (var name in instance.sig.renderers)
      instance.sig.renderers[name].resize(width, height);
  }
});
