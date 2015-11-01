window.requestAnimationFrame(function() {
    window.GM = new GameManager(9, 9, 10,
        {
            'table_id': 'game_grid',
            'start_button_id': 'game_start',
            'mine_count_id': 'game_mines'
        }
    );
});