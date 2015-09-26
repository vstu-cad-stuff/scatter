var c_hidden = 0, c_visible = 1;
var c_lat = 0, c_lon = 1, c_index = 2, c_pop = 3;

var h_list = document.getElementById('list');

var map = L.map('map').setView([48.7941, 44.8009], 13);

L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var colors = [
    '#ff6347', '#556b2f', '#89390a', '#a00000', '#845038',
    '#006400', '#aebcbe', '#8b008b', '#1387a9', '#ff7f50',
    '#300000', '#e9967a', '#db7093', '#add8e6', '#ffd700',
    '#8c8f8f', '#654321', '#40e0d0', '#239837', '#8387ba',
    '#394991', '#dabd13', '#923999', '#f08080', '#c71585',
    '#ff0000', '#008080', '#adff2f', '#ee82ee', '#b22222',
    '#0000ff', '#7cfc00', '#101101', '#a9a9a9', '#bf883a',
    '#bdb76b', '#6b8e23', '#1e90ff', '#20958a', '#808080',
    '#ffe4e1', '#d3d3d3', '#87cefa', '#4169e1', '#ab477e',
    '#9a9a32', '#9acd32', '#cd853f', '#191970', '#8fbc8f',
    '#000080', '#98fb98', '#e0ffff', '#6a5acd', '#983490',
    '#498ba9', '#ff69b4', '#48989e', '#000030', '#2e8b57',
    '#ba7ea7', '#a52a2a', '#5f9ea0', '#2f4f4f', '#90ee90',
    '#000000', '#b72004', '#9400d3', '#aaaae5', '#228b22',
    '#00fa9a', '#00ff00', '#8b4513', '#00ced1', '#00a000',
    '#778899', '#ffff00', '#f4a460', '#87ceeb', '#9370db',
    '#ba7478', '#b0c4de', '#ffe4b5', '#ff8122', '#ffe4c4',
    '#8a2be2', '#808000', '#ffb6c1', '#c0c0c0', '#0000a0',
    '#ffa07a', '#bd8747', '#00bfff', '#00ff7f', '#eab478',
    '#405719', '#0987b3', '#d2b48c', '#dc143c', '#4682b4',
    '#d2691e', '#d38887', '#bf8949', '#66cdaa', '#906090',
    '#32cd32', '#ba8910', '#7b68ee', '#00008b', '#cd5c5c',
    '#008b8b', '#cc1328', '#be8378', '#9932cc', '#a0522d',
    '#8b0000', '#ff00ff', '#da70d6', '#afeeee', '#fa8072',
    '#8748a8', '#696969', '#800080', '#73287a', '#0000cd',
    '#7fff00', '#4b0082', '#48d1cc', '#ff8c00', '#6495ed',
    '#daa520', '#00ffff', '#bc8f8f', '#20b2aa', '#deb887',
    '#1285ff', '#ffa500', '#ff4500', '#123456', '#babbab',
    '#ff1493', '#7fffd4', '#b0e0e6', '#2e7a57', '#483d8b',
    '#ba55d3', '#b8860b', '#f5deb3', '#800000', '#008000',
    '#003000', '#dda0dd', '#389218', '#708090', '#013370'
];

relast = function() {
    var lis = h_list.getElementsByTagName('li');
    if (lis.length > 0) {
        for (var i in lis)
            lis[i].className = '';
        lis[lis.length - 1].className = 'last';
    }
};

clusters = [];
getNumber = function() {
    return clusters.length;
};

Cluster = (function() {
    function Cluster(array) {
        this.number = getNumber();
        this.visibility = c_hidden;
        this.list = array;
        this.color = colors[this.number % colors.length];
        this.layer = new L.FeatureGroup();
        for (var i in this.list) {
            var r = 3 + Math.pow(this.list[i][c_pop], 1 / 3) * 2;
            var m = 'Cluster #' + this.list[i][c_index] + ': ' +
                    this.list[i][c_lat] + ', ' +
                    this.list[i][c_lon] + ', ' +
                    this.list[i][c_pop] + 'p.<br />' +
                    'From cluster set #' + this.number;
            var circle = L.circleMarker(
                [this.list[i][c_lat], this.list[i][c_lon]], {
                    color: this.color, radius: r, weight: 2, fillOpacity: 0.5
                }).bindPopup(m);
            this.layer.addLayer(circle);
        }
        var li = document.createElement('li');
        li.setAttribute('id', 'liCSet' + this.number);
        h_list.appendChild(li);
        relast();
        var button = document.createElement('button');
        button.setAttribute('id', 'butCSet' + this.number);
        button.style.backgroundColor = this.color;
        button.innerHTML = this.number;
        button.setAttribute('onClick', 'clusters[' + this.number + '].hide()');
        button.setAttribute('onContextmenu', 'clusters[' + this.number + '].delete()');
        button.setAttribute('title', 'Left-click to hide/show; right-click to delete');
        if (parseInt('0x' + this.color.slice(1)) <= 0xaaaae5) {
            button.style.color = '#fff';
        } else {
            button.style.color = '#000';
        }
        li.appendChild(button);
        this.li = li;
        this.button = button;
        this.show();
        return this;
    }

    Cluster.prototype.hide = function() {
        if (this.visibility == c_hidden) {
        } else {
            map.removeLayer(this.layer);
            this.visibility = c_hidden;
            this.button.setAttribute('onClick',
                'clusters[' + this.number + '].show()');
            this.button.className += ' hidden';
        }
    };

    Cluster.prototype.show = function() {
        if (this.visibility == c_visible) {
        } else {
            map.addLayer(this.layer);
            this.visibility = c_visible;
            this.button.setAttribute('onClick',
                'clusters[' + this.number + '].hide()');
            this.button.className = this.button.className.replace(' hidden', '');
        }
    };

    Cluster.prototype.delete = function() {
        if (this.visibility == c_visible) {
            map.removeLayer(this.layer);
        }
        delete clusters[this.number];
        this.li.removeChild(this.button);
        h_list.removeChild(this.li);
        relast();
    };

    return Cluster;
})();

// load function
function load() {
    var input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('multiple', true);
    document.body.appendChild(input);
    document.body.onfocus = cancel;
    input.click();
    input.addEventListener('change', read, false);
    function read() {
        var files = input.files;
        function onload(evt) {
            var string = evt.target.result;
            data = JSON.parse(string);
            clusters.push(new Cluster(data));
        }
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            var start = 0;
            var stop = file.size - 1;
            var reader = new FileReader();
            reader.onload = onload;

            blob = file.slice(start, stop + 1);
            reader.readAsBinaryString(blob);
        }
    }
    function cancel() {
        document.body.onfocus = '';
        document.body.removeChild(input);
    }
}
