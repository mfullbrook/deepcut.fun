<?php

namespace App;

use Carbon\CarbonImmutable;
use ErrorException;

class Fetcher
{

    public function update()
    {
        $today = new CarbonImmutable();
        $eow = $today->endOfWeek();

        // update for current month
        $this->fetchAndUpsert($today);

        $nextMonth = $today->addMonth();
        $this->fetchAndUpsert($nextMonth);
    }

    public function fetchAndUpsert($date)
    {
        $data = $this->fetch($date);

        if (count($data) === 0) {
            return;
        }

        collect($data)
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
        try {
            $table = html5qp($url, '#aldershot-training-area-g2 + table');
        } catch (ErrorException $e) {
            return [];
        }
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
