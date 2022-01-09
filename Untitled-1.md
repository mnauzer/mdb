mdblib./*

    1) Install the library - $[prompt]

        composer require tymon/jwt-auth

    2) Add the provider in the file [/config/app.php]

        ...
        providers' => [
            ...
            jwt_provider
            ...
        ],

    3) Publish the provider. Will be create a file [/config/jwt.php] - $[prompt]

        php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"

    4) In the [.env] will be generate a secret key of JWT - $[prompt]

        php artisan jwt:secret

    5) Add the Middleware [/App/Http/Kernel.php]

        ...
        protected $routeMiddleware = [
            ...
            jwt_middleware
        ];

    6) Add the Routes [routes/api.php]

        jwt_routes

    7) Updating User Model [App/User.php] implements JWTSubject

        ...
        jwt_use_subject

        class User extends Authenticatable jwt_user_implements
        {
            ...

            jwt_user_methods
        }

    8) Creating Registration Form Request - $[prompt]

        php artisan make:request RegistrationFormRequest

    9) Creating Validations Rules [/App/Http/Requests/RegistrationFormRequest.php]

        ...
        public function authorize()
        {
            return true;
        }
        ...
        public function rules()
        {
            return [
                jwt_register_rule
            ];
        }

    10) Creating API Controller for Login and Registration - $[prompt]

        php artisan make:controller APIController

    11) Creating methods in API Controller [app/Http/Controllers/APIController.php]

        use Illuminate\Http\Request;
        jwt_use_api_controller

        class APIController extends Controller
        {
            jwt_register_method
            jwt_login_method
            jwt_logout_method
            jwt_me_method
        }

*/