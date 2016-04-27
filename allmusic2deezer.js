// ==UserScript==
// @name        Allmusic @ Deezer
// @namespace   svarnyjunak
// @include     http*://www.allmusic.com/*
// @version     1
// @grant       GM_xmlhttpRequest
// ==/UserScript==
/* jshint undef: true, unused: true */
/* globals GM_xmlhttpRequest */
(function () {
    "use strict";
    
    try {
        var deezer = {
            makeRequest: function(url, callback) {
                GM_xmlhttpRequest({
                    method: "GET",
                    url: url,
                    onload: function(response) {
                        callback(JSON.parse(response.responseText));
                    }
                });
            },
            getArtist: function(artistName, callback) {
                var url = 'https://api.deezer.com/search/artist/?q=' + artistName + '&index=0&limit=5&output=json';
                this.makeRequest(url, callback);
            },
            getAlbum: function(albumName, callback) {
                var url = 'https://api.deezer.com/search/album/?q=' + albumName + '&index=0&limit=5&output=json';
                this.makeRequest(url, callback);
            }
        };

        var editorsChoice = {
            getArtistName: function(choice) {
                var artistElement = choice.getElementsByClassName('artist')[0];
                if(artistElement === undefined) {
                    return undefined;
                }

                var anchor = artistElement.getElementsByTagName('a')[0];
                if(anchor === undefined) {
                    return undefined;
                }
                return anchor.textContent;
            },
            getAlbumName: function(choice) {
                var titleElement = choice.getElementsByClassName('title')[0];
                if(titleElement === undefined) {
                    return undefined;
                }

                var anchor = titleElement.getElementsByTagName('a')[0];
                if(anchor === undefined) {
                    return undefined;
                }
                return anchor.textContent;
            }
        };

        var LinkAdder = function() {
            this.artistsJson = undefined;
            this.albumsJson = undefined;
            this.deezerClassName = 'deezer-link';
            this.getDeezerLinkUrl = function() {
                var artists = this.artistsJson.data;
                if(artists.length === 0) {
                    return;
                }

                var albums = this.albumsJson.data;
                var artist = artists[0];
                for(var i = 0;i<albums.length;i++) {
                    var album = albums[i];
                    if(album.artist.id === artist.id) {
                        return album.link;
                    }
                }
            };
        };

        LinkAdder.prototype = {
            linkAlreadyAdded: function(element) {
                return element.getElementsByClassName(this.deezerClassName).length > 0;
            },

            tryAddLinkToDeezer: function(element) {
                if(this.artistsJson === undefined || this.albumsJson === undefined) {
                    return;
                }

                var link = document.createElement("a");
                link.style.fontSize = 'larger';
                link.classList.add(this.deezerClassName);

                var url = this.getDeezerLinkUrl();
                if(url !== undefined) {
                    link.href = url;
                    link.textContent = 'Play on deezer!';
                }
                else {
                    link.textContent = 'Upps, no album like that found!';
                    link.style.color = 'Red';
                }

                if(!this.linkAlreadyAdded(element)) {
                    var albumCover = element.getElementsByClassName('album-cover')[0];
                    element.insertBefore(link,albumCover);
                }
            }
        };


        var editorsChoices = document.getElementsByClassName('editors-choice');
        var showLinkToDeezer = function(){
            var currentChoice = this;
            var linkAdder = new LinkAdder();

            if(!linkAdder.linkAlreadyAdded(currentChoice)) {//ještě jsem ten link nepřidali
                var albumName = editorsChoice.getAlbumName(currentChoice);
                var artistName = editorsChoice.getArtistName(currentChoice);

                deezer.getAlbum(albumName, function(json) {
                    linkAdder.albumsJson = json;
                    linkAdder.tryAddLinkToDeezer(currentChoice);
                });

                deezer.getArtist(artistName, function(json) {
                    linkAdder.artistsJson = json;
                    linkAdder.tryAddLinkToDeezer(currentChoice);
                });
            }
        };

        for(var i = 0; i<editorsChoices.length;i++){
            var choice = editorsChoices[i];
            choice.onmouseover = showLinkToDeezer;
        }
    }
    catch(e){
        console.log(e);
        throw e;
    }
})();
