"""Summarize an anonymized Being Found formative classroom pilot. Standard library only.

Never prints participant identifiers or free-text answers. No network or persistence.
"""
import argparse
import csv
import statistics
from pathlib import Path

COLUMNS = [
    'participant_id', 'device', 'input_mode', 'completed', 'elapsed_seconds',
    'first_action_seconds', 'assist_count', 'blocker_count', 'blocker_stage',
    'possibility_vs_ability', 'observation_vs_inference',
    'uncertainty_and_consent', 'fiction_not_diagnosis', 'assumed_fiction_fact',
]
SCORES = COLUMNS[9:13]
STAGES = {'', 'title', 'noor', 'dele', 'authored_day', 'walt', 'reflection', 'multiple', 'other'}


def number(value, column, line, integer=False):
    if not value:
        return None
    try:
        result = int(value) if integer else float(value)
    except ValueError as exc:
        raise ValueError(f'row {line}: {column} must be a nonnegative number') from exc
    if result < 0 or result != result or result == float('inf'):
        raise ValueError(f'row {line}: {column} must be finite and nonnegative')
    return result


def validate(row, line):
    for column in ('completed', 'assumed_fiction_fact'):
        allowed = {'', 'yes', 'no'} if column == 'completed' else {'', 'yes', 'no', 'unclear'}
        if row[column] not in allowed:
            raise ValueError(f'row {line}: {column} must be {sorted(allowed)}')
    for column in SCORES:
        if row[column] not in ('', '0', '1', '2'):
            raise ValueError(f'row {line}: {column} must be blank, 0, 1 or 2')
    if row['blocker_stage'] not in STAGES:
        raise ValueError(f'row {line}: unknown blocker stage')
    for column in ('elapsed_seconds', 'first_action_seconds'):
        number(row[column], column, line)
    for column in ('assist_count', 'blocker_count'):
        number(row[column], column, line, integer=True)


def load(path):
    with open(path, newline='', encoding='utf-8-sig') as handle:
        reader = csv.DictReader(handle)
        if not reader.fieldnames or list(reader.fieldnames) != COLUMNS:
            raise ValueError('CSV header differs from pilot/observations.csv template')
        rows = []
        for line, raw in enumerate(reader, 2):
            if None in raw:
                raise ValueError(f'row {line}: unexpected extra column')
            row = {column: (raw.get(column) or '').strip() for column in COLUMNS}
            # Blank preprinted P01–P05 slots are not participants.
            if not any(row[column] for column in COLUMNS if column != 'participant_id'):
                continue
            if not row['participant_id'].startswith('P') or not row['participant_id'][1:].isdigit():
                raise ValueError(f'row {line}: use a pseudonym such as P01, not a name')
            validate(row, line)
            rows.append(row)
    if len({r['participant_id'] for r in rows}) != len(rows):
        raise ValueError('duplicate participant IDs')
    return rows


def analyze(rows):
    finished = [r for r in rows if r['completed'] == 'yes']
    times = [float(r['elapsed_seconds']) for r in finished if r['elapsed_seconds']]
    first_actions = [float(r['first_action_seconds']) for r in rows if r['first_action_seconds']]
    return {
        'attempts': len(rows), 'finished': len(finished), 'timed': len(times),
        'median': statistics.median(times) if times else None,
        'min': min(times) if times else None, 'max': max(times) if times else None,
        'within_target': sum(600 <= s <= 900 for s in times),
        'first_actions': len(first_actions),
        'first_within_20s': sum(s <= 20 for s in first_actions),
        'assists': sum(int(r['assist_count']) for r in rows if r['assist_count']),
        'blockers': sum(int(r['blocker_count']) for r in rows if r['blocker_count']),
        'misread_yes': sum(r['assumed_fiction_fact'] == 'yes' for r in rows),
        'misread_observed': sum(r['assumed_fiction_fact'] != '' for r in rows),
        'concepts': {key: {score: sum(r[key] == score for r in rows)
                           for score in ('0', '1', '2')} for key in SCORES},
    }


def fmt(s):
    return f'{int(s) // 60}:{int(s) % 60:02d}'


def render(result):
    print(f"Recorded sessions: {result['attempts']}; completed: {result['finished']}")
    if result['timed']:
        print(f"Guided-story time: median {fmt(result['median'])}; range "
              f"{fmt(result['min'])}–{fmt(result['max'])}; "
              f"10–15 min: {result['within_target']}/{result['timed']} timed completions")
    else:
        print('Guided-story time: no completed sessions with timing recorded')
    print(f"First meaningful room action within 20 seconds: "
          f"{result['first_within_20s']}/{result['first_actions']} observed")
    print(f"Observer assists: {result['assists']}; recorded blockers: {result['blockers']}")
    print(f"Confused fictional story with observed fact: "
          f"{result['misread_yes']}/{result['misread_observed']} assessed")
    for key, scores in result['concepts'].items():
        print(f"{key}: 0={scores['0']}, 1={scores['1']}, 2={scores['2']}; "
              f"rated={sum(scores.values())}")
    print('Descriptive formative data only. No norm, psychometric score, or causal inference.')


def self_test():
    def row(**kwargs):
        result = dict.fromkeys(COLUMNS, '')
        result.update(kwargs)
        return result
    examples = [row(participant_id='P01', completed='yes', elapsed_seconds='600',
                    first_action_seconds='15', possibility_vs_ability='2', blocker_count='1'),
                row(participant_id='P02', completed='yes', elapsed_seconds='900',
                    first_action_seconds='25', observation_vs_inference='1')]
    for idx, record in enumerate(examples, 2):
        validate(record, idx)
    stats = analyze(examples)
    assert stats['median'] == 750 and stats['within_target'] == 2
    assert stats['first_within_20s'] == 1 and stats['blockers'] == 1
    assert stats['concepts']['possibility_vs_ability']['2'] == 1
    print('PASS pilot summary self-test: validation, denominators, timing and concept counts')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('csv_file', nargs='?', default='pilot/observations.csv')
    parser.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    if args.self_test:
        self_test()
    else:
        render(analyze(load(Path(args.csv_file))))
