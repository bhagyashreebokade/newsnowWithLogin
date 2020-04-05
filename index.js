(function () {
angular.module('todoApp', ['ngAria', 'ngAnimate', 'ngMaterial', 'ngMessages','ngRoute', 'ngCookies'])
    .controller('Newsnow', function ($scope, $http, $mdDialog) {
        $scope.selectedCountry = 'in';
        $scope.search = '';
        const apiKey = '45b42b4a800c4b6cb7da2ce682ad6866';
        const weatherAPIID = '09424e0671b84cd6e658ab03ee39305c';
        const weatherAPI = 'http://api.openweathermap.org/data/2.5/weather?units=metric';

        $scope.categories = ['general', 'sports', 'science', 'technology', 'business', 'entertainment', 'health'];

        $scope.countries = [{ id: 'in', name: 'India', capital: 'Delhi' }, { id: 'us', name: 'USA', capital: 'Washington' }, { id: 'ch', name: 'China', capital: 'Beijing' }, { id: 'au', name: 'Australia', capital: 'Canberra' }, { id: 'jp', name: 'Japan', capital: 'Tokyo' }, { id: 'it', name: 'Italy', capital: 'Rome' }, { id: 'nz', name: 'New Zealand', capital: 'Wellington' }];

        $scope.showDialog = function (evt) {
            return $mdDialog.show({
                controller: function ($scope) {
                    return angular.extend($scope, {
                        user: {
                            password: '',
                            email: '',
                            firstName: '',
                            lastName: '',
                            company: 'NewsNow',
                            address: '',
                            address2: '',
                            city: '',
                            state: '',
                            favourites: '',
                            postalCode: '',
                            ok: 'Signup',
                            cancel: 'Cancel'
                        },
                        closeDialog: function () {
                            return $mdDialog.hide();
                        }
                    });
                },
                controller: DialogController,
                templateUrl: 'dialogContent.tmpl.html',
                fullscreen: true,
                targetEvent: evt
            }).then(function (result) {
                console.log('result :: ', result);
            }, function (err) {
                console.log('resut err:: ', err);
            });
        };

        function DialogController($scope, $mdDialog) {
            $scope.hide = function() {
              $mdDialog.hide();
            };
        
            $scope.cancel = function() {
              $mdDialog.cancel();
            };
        
            $scope.answer = function(answer) {
              $mdDialog.hide(answer);
            };

            $scope.signup = function(event) {
                console.log('event :: ',event);
                $mdDialog.hide(event);
              };
          }

        $scope.showPrompt = function (ev) {
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.prompt()
                .title('Login')
                .textContent('Bowser is a common name.')
                .placeholder('Dog name')
                .ariaLabel('Dog name')
                .initialValue('Buddy')
                .targetEvent(ev)
                .required(true)
                .ok('Okay!')
                .cancel('I\'m a cat person');

            $mdDialog.show(confirm).then(function (result) {
                $scope.status = 'You decided to name your dog ' + result + '.';
            }, function () {
                $scope.status = 'You didn\'t name your dog.';
            });
        };

        $scope.displayCategory = (category) => {
            let url;
            if ($scope.search) {
                url = 'http://newsapi.org/v2/everything?qInTitle=' + $scope.search + '&apiKey=' + apiKey + '&pageSize=100';
            } else if (!$scope.search) {
                if (category) {
                    url = 'https://newsapi.org/v2/top-headlines?country=' + $scope.selectedCountry + '&pageSize=100&apiKey=' + apiKey + '&category=' + category;
                } else {
                    url = 'https://newsapi.org/v2/top-headlines?country=' + $scope.selectedCountry + '&pageSize=100&apiKey=' + apiKey + '&category=' + $scope.categories[0];
                }

            }

            $http.get(url).then(function (response) {
                console.log('response :: ', response);
                $scope.results = response.data;
            }, function (reason) {
                console.log('Error reason :: ', reason);
            });
        };

        //Calling the API on first load & on country change
        $scope.$watch('selectedCountry', () => {
            $scope.displayCategory($scope.categories[0]);
            $scope.displayWeather();
        });

        $scope.displayWeather = function () {
            //Calling weather APIs
            //if location is avaiable call from long-lang, else call from capital city
            let weatherURL = weatherAPI + '&appid=' + weatherAPIID;
            if (!navigator.geolocation) {
                status.textContent = 'Geolocation is not supported by your browser';
                //call from city
                let cityName = $scope.countries.filter(country => country.capital == $scope.selectedCountry);
                weatherURL = weatherURL + 'q=' + cityName;
                $scope.getWeatherData(weatherURL);
            } else {
                status.textContent = 'Locating…';
                navigator.geolocation.getCurrentPosition((position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    weatherURL = weatherURL + '&lat=' + latitude + '&lon=' + longitude;
                    $scope.getWeatherData(weatherURL);
                }, (error) => {
                    console.log('geolocation error : ', error);
                    $scope.getCountry($scope.getWeatherData);
                });
            }
            $scope.getCountry = function (callback) {
                let country = $scope.countries.filter(country => country.id == $scope.selectedCountry);
                weatherURL = weatherURL + '&q=' + country[0].capital;
                callback(weatherURL);
            };

            $scope.getWeatherData = function (weatherURL) {
                $http.get(weatherURL).then(function (response) {
                    console.log('response :: ', response);
                    $scope.weatherResults = response.data;
                }, function (reason) {
                    console.log('Error reason :: ', reason);
                });
            };
        };


    })
    .config(config)
    .run(run);
    config.$inject = ['$routeProvider', '$locationProvider'];
    function config($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                controller: 'HomeController',
                templateUrl: 'home/home.view.html',
                controllerAs: 'vm'
            })

            .when('/account', {
                controller: 'AccountController',
                templateUrl: 'account/account.view.html',
                controllerAs: 'vm'
            })

            .when('/login', {
                controller: 'LoginController',
                templateUrl: 'login/login.view.html',
                controllerAs: 'vm'
            })

            .when('/register', {
                controller: 'RegisterController',
                templateUrl: 'register/register.view.html',
                controllerAs: 'vm'
            })

            .otherwise({ redirectTo: '/login' });
    }

    run.$inject = ['$rootScope', '$location', '$cookies', '$http'];
    function run($rootScope, $location, $cookies, $http) {
        // keep user logged in after page refresh
        $rootScope.globals = $cookies.getObject('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata;
        }

        $rootScope.$on('$locationChangeStart', function (event, next, current) {
            // redirect to login page if not logged in and trying to access a restricted page
            var restrictedPage = $.inArray($location.path(), ['/login', '/register']) === -1;
            var loggedIn = $rootScope.globals.currentUser;
            if (restrictedPage && !loggedIn) {
                $location.path('/login');
            }
        });
    }
})();

(async function () {
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./sw.js');
        } catch (e) {
            console.log(`SW registration failed`);
        }
    }
})();