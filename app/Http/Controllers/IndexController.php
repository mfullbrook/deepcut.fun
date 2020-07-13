<?php

namespace App\Http\Controllers;

use App\AreaDate;
use Illuminate\Http\Request;

class IndexController extends Controller
{
    public function index()
    {
        $today = now();
        $dates = AreaDate::query()
            ->whereArea('g2')
            ->whereBetween('date', [$today->startOfMonth(), $today->endOfMonth()])
            ->orderBy('date')
            ->get();

        return view('index', compact('dates'));
    }
}
