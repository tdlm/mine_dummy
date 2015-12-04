window.requestAnimationFrame(function() {
    window.GM = new GameManager(30, 16, 99,
        {
            'table_id': 'game_grid',
            'start_button_id': 'game_start',
            'mine_count_id': 'game_mines'
        }
    );
});