<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Deepcut Woods</title>

        <!-- Fonts -->
{{--        <link href="https://fonts.googleapis.com/css?family=Nunito:200,600" rel="stylesheet">--}}
        <link href="{{ mix('css/main.css') }}" rel="stylesheet" />

    </head>
    <body class="bg-gray-800">
        <div id="app">
            <div class="w-full md:w-120 mx-auto ">
                <h1 class="text-white text-3xl text-center font-thin my-4 tracking-wider">Deepcut Woods</h1>
               <woods-calendar :dates="{{ json_encode($dates) }}" />
            </div>
        </div>
        <script src="{{ mix('js/app.js') }}"></script>
    </body>
</html>
