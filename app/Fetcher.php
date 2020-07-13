<?php

namespace App;

use Carbon\CarbonImmutable;

class Fetcher
{

    public function update()
    {
        $today = now();
        $eow = now()->endOfWeek();

        // update for current month
        $this->fetchAndUpsert($today);

        if ($eow->monthName !== $today->monthName) {
            $this->fetchAndUpsert($eow);
        }
    }

    public function fetchAndUpsert($date)
    {
        collect($this->fetch($date))
            ->eachSpread(function(CarbonImmutable $date, $isOpen) {
                $model = AreaDate::query()->firstOrNew(['area' => 'g2', 'date' => $date]);
                $model->is_open = $isOpen;
                $model->save();
            });
    }

    public function fetch(CarbonImmutable $date): array
    {
        $month = strtolower($date->monthName);
        $url = 'https://www.gov.uk/government/publications/south-east-training-estate-firing-times/'
             . "aldershot-training-area-closure-times-{$month}-{$date->year}";

        $table = html5qp($url, '#aldershot-training-area-g2 + table');
//        $table = html5qp(storage_path('app/test.html'), '#aldershot-training-area-g2 + table');
        $rows = $table->findInPlace('tbody > tr');

        $data = [];

        foreach ($rows as $row) {
            $cells = $row->find('td');
            $data[] = [
                $date->setDay($cells->get(0)->nodeValue),
                $cells->get(1)->nodeValue === 'Open to Public'
            ];
        }

        return $data;
    }

}
